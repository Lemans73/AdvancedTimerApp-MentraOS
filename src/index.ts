import path from 'path';
import { AppServerConfig } from '@mentra/sdk'; // SDK import
import { AdvancedTimerApp } from './app'; // Import main app class
import events from 'events'; // Import 'events' module
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenv.config();

events.EventEmitter.defaultMaxListeners = 30; 
console.log(`[index.ts] DefaultMaxListeners set to ${events.EventEmitter.defaultMaxListeners}`);


// --- Configuration Constants ---
// Read from environment variables, with fallbacks for PORT
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 80;
const PACKAGE_NAME = process.env.PACKAGE_NAME || (() => { throw new Error('PACKAGE_NAME environment variable is required'); })();
const API_KEY = process.env.API_KEY || (() => { throw new Error('API_KEY environment variable is required'); })();

// --- Server Configuration - Change .env file to use your own API key, Package Name and Port ---
const tpaServerConfig: AppServerConfig = {
    packageName: PACKAGE_NAME,
    apiKey: API_KEY, 
    port: PORT, 
    publicDir: path.join(__dirname, './')
};

// --- Validation of the configuration van de Configuratie (verplaatst van app.ts) ---
if (!process.env.PACKAGE_NAME || process.env.PACKAGE_NAME === 'com.example.tpa' ) {
    console.error("FATAL: PACKAGE_NAME is niet ingesteld of gebruikt een standaard placeholder! Controleer uw .env bestand of configuratie.");
    process.exit(1);
}
if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_API_KEY_PLACEHOLDER') {
    console.warn("WAARSCHUWING: API_KEY is niet ingesteld of gebruikt een placeholder! De app zal mogelijk niet correct functioneren met de AugmentOS backend.");
}

console.log(`[index.ts] Starting AdvancedTimerApp with config:`, {
    packageName: tpaServerConfig.packageName,
    port: tpaServerConfig.port,
    publicDir: tpaServerConfig.publicDir,
});

const appInstance = new AdvancedTimerApp(tpaServerConfig);

appInstance.start().then(() => {
    console.log(`[index.ts] AdvancedTimerApp server gestart op poort ${appInstance.ownPort}. Pakket: ${appInstance.ownPackageName}`);
}).catch(error => {
    console.error("[index.ts] Kon AdvancedTimerApp server niet starten:", error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n[index.ts] SIGINT ontvangen, poging tot graceful shutdown...');
    try {
        appInstance.stop();
        console.log('[index.ts] AdvancedTimerApp server succesvol gestopt na SIGINT.');
    } catch (err) {
        console.error('[index.ts] Fout tijdens appInstance.stop() na SIGINT:', err);
    } finally {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('\n[index.ts] SIGTERM ontvangen, poging tot graceful shutdown...');
    try {
        appInstance.stop();
        console.log('[index.ts] AdvancedTimerApp server succesvol gestopt na SIGTERM.');
    } catch (err) {
        console.error('[index.ts] Fout tijdens appInstance.stop() na SIGTERM:', err);
    } finally {
        process.exit(1);
    }
});

console.log('[index.ts] Applicatie opstartscript voltooid. Wacht op server start...');


