const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function cleanCompanyName(name) {
    if (!name || name === '') return null;
    return String(name).trim();
}

function extractLocations(matchedLocations) {
    if (!matchedLocations) return ['España'];
    try {
        if (typeof matchedLocations === 'string') {
            // Intentar parsear JSON
            const parsed = JSON.parse(matchedLocations);
            if (Array.isArray(parsed)) return parsed;
            return [String(parsed)];
        } else if (Array.isArray(matchedLocations)) {
            return matchedLocations;
        }
        return [String(matchedLocations)];
    } catch {
        return ['España'];
    }
}

async function uploadData() {
    try {
        console.log('📖 Leyendo archivo Excel...');
        
        // Leer el archivo Excel
        const workbook = XLSX.readFile('empresas.xlsx');
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        console.log(`📊 Encontrados ${data.length} registros`);
        
        // Extraer empresas únicas
        const companiesMap = new Map();
        const reviewsData = [];
        
        for (const row of data) {
            const companyName = cleanCompanyName(row.organization);
            const title = row.title || '';
            
            if (companyName && title) {
                // Añadir empresa
                if (!companiesMap.has(companyName)) {
                    companiesMap.set(companyName, {
                        name: companyName,
                        review_count: 0
                    });
                }
                
                // Extraer ubicación
                const locations = extractLocations(row.matched_locations);
                const mainLocation = locations[0] || 'España';
                
                // Crear review
                reviewsData.push({
                    company: companyName,
                    position: title,
                    process_type: 'online',
                    received_response: false,
                    interview_count: 1,
                    received_feedback: false,
                    process_duration: '<1 semana',
                    rating_communication: 3,
                    rating_clarity: 3,
                    rating_respect: 3,
                    would_reapply: true,
                    improvement_text: `Ubicación: ${mainLocation}`
                });
            }
        }
        
        const companiesList = Array.from(companiesMap.values());
        console.log(`🏢 ${companiesList.length} empresas únicas`);
        console.log(`📝 ${reviewsData.length} reviews preparadas`);
        
        // Subir empresas en lotes
        console.log('🚀 Subiendo empresas...');
        const batchSizeCompanies = 100;
        for (let i = 0; i < companiesList.length; i += batchSizeCompanies) {
            const batch = companiesList.slice(i, i + batchSizeCompanies);
            const { error } = await supabase
                .from('companies')
                .insert(batch)
                .select();
            
            if (error) {
                console.error('❌ Error subiendo empresas:', error);
            } else {
                console.log(`✅ Subidas ${batch.length} empresas`);
            }
        }
        
        // Subir reviews en lotes
        console.log('🚀 Subiendo reviews...');
        const batchSizeReviews = 50;
        for (let i = 0; i < reviewsData.length; i += batchSizeReviews) {
            const batch = reviewsData.slice(i, i + batchSizeReviews);
            const { error } = await supabase
                .from('reviews')
                .insert(batch)
                .select();
            
            if (error) {
                console.error('❌ Error subiendo reviews:', error);
            } else {
                console.log(`✅ Subidas ${batch.length} reviews`);
            }
        }
        
        console.log('🎉 ¡Datos subidos correctamente!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadData();