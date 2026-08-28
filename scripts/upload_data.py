import pandas as pd
import json
import os
from supabase import create_client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_company_name(name):
    """Limpiar nombre de empresa"""
    if pd.isna(name) or name == '':
        return None
    name = str(name).strip()
    return name

def extract_locations(matched_locations):
    """Extraer ubicaciones del campo matched_locations"""
    if pd.isna(matched_locations):
        return []
    try:
        if isinstance(matched_locations, str):
            locations = json.loads(matched_locations)
            if isinstance(locations, str):
                return [locations]
            return locations
        elif isinstance(matched_locations, list):
            return matched_locations
        else:
            return [str(matched_locations)]
    except:
        return [str(matched_locations)]

def upload_companies():
    """Subir empresas a la tabla companies"""
    # Leer el archivo Excel
    df = pd.read_excel('empresas.xlsx')
    
    companies = []
    for idx, row in df.iterrows():
        company_name = clean_company_name(row['organization'])
        if company_name:
            companies.append({
                'name': company_name,
                'review_count': 0
            })
    
    # Eliminar duplicados
    unique_companies = {comp['name']: comp for comp in companies}.values()
    companies_list = list(unique_companies)
    
    print(f'📊 Encontradas {len(companies_list)} empresas únicas')
    
    # Subir a Supabase en lotes de 100
    batch_size = 100
    for i in range(0, len(companies_list), batch_size):
        batch = companies_list[i:i+batch_size]
        try:
            result = supabase.table('companies').insert(batch).execute()
            print(f'✅ Subidas {len(batch)} empresas')
        except Exception as e:
            print(f'❌ Error subiendo empresas: {e}')

def upload_reviews():
    """Subir reviews a la tabla reviews"""
    df = pd.read_excel('empresas.xlsx')
    
    reviews = []
    for idx, row in df.iterrows():
        company_name = clean_company_name(row['organization'])
        title = row.get('title', '')
        
        if company_name and title:
            locations = extract_locations(row.get('matched_locations'))
            main_location = locations[0] if locations else 'España'
            
            review = {
                'company': company_name,
                'position': title,
                'process_type': 'online',
                'received_response': False,
                'interview_count': 1,
                'received_feedback': False,
                'process_duration': '<1 semana',
                'rating_communication': 3,
                'rating_clarity': 3,
                'rating_respect': 3,
                'would_reapply': True,
                'improvement_text': f'Ubicación: {main_location}'
            }
            reviews.append(review)
    
    print(f'📊 Preparadas {len(reviews)} reviews')
    
    batch_size = 50
    for i in range(0, len(reviews), batch_size):
        batch = reviews[i:i+batch_size]
        try:
            result = supabase.table('reviews').insert(batch).execute()
            print(f'✅ Subidas {len(batch)} reviews')
        except Exception as e:
            print(f'❌ Error subiendo reviews: {e}')

if __name__ == '__main__':
    # Verificar que el archivo existe
    if not os.path.exists('empresas.xlsx'):
        print('❌ Error: No encuentro el archivo "empresas.xlsx"')
        print('📁 Asegúrate de que el archivo está en la carpeta actual:')
        print(f'   {os.getcwd()}')
        exit()
    
    print('🚀 Comenzando subida de datos...')
    upload_companies()
    upload_reviews()
    print('✅ ¡Datos subidos correctamente!')