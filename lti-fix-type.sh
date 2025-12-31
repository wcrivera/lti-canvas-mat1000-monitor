#!/bin/bash

echo "🔧 Solucionando errores de TypeScript..."

cd quiz-monitor-backend

# Paso 1: Instalar tipos para ims-lti
echo "📦 Instalando @types/ims-lti..."
npm install --save-dev @types/ims-lti || yarn add -D @types/ims-lti

# Paso 2: Si no existe @types/ims-lti, crear archivo de declaración
if [ ! -d "node_modules/@types/ims-lti" ]; then
    echo "⚠️  @types/ims-lti no existe, creando declaración manual..."
    
    mkdir -p src/types
    
    cat > src/types/ims-lti.d.ts << 'DTSFILE'
declare module 'ims-lti' {
  export class Provider {
    constructor(consumerKey: string, consumerSecret: string);
    valid_request(req: any, callback: (err: Error | null, isValid: boolean) => void): void;
  }
}
DTSFILE

    echo "✅ Archivo de declaración creado en src/types/ims-lti.d.ts"
fi

echo "✅ Corrección completada"