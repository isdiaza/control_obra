import { NodeSSH } from 'node-ssh';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log('🔗 Conectando al VPS...');
    await ssh.connect({
      host: '76.13.101.174',
      username: 'root',
      password: 'tJUknw@K4JSJW5&cx'
    });
    console.log('✅ Conexión SSH establecida.');

    console.log('📦 Actualizando servidor e instalando Nginx (si es necesario)...');
    await ssh.execCommand('apt-get update && apt-get install -y nginx');
    
    console.log('🧹 Limpiando directorio /var/www/html...');
    await ssh.execCommand('rm -rf /var/www/html/*');

    console.log('🚀 Subiendo archivos de producción (dist)...');
    const localDistPath = path.join(__dirname, 'dist');
    const remotePath = '/var/www/html';
    
    const failed = [];
    const successful = [];
    
    await ssh.putDirectory(localDistPath, remotePath, {
      recursive: true,
      concurrency: 10,
      tick: function(localPath, remotePath, error) {
        if (error) {
          failed.push(localPath);
        } else {
          successful.push(localPath);
        }
      }
    });

    console.log(`✅ Archivos subidos: ${successful.length}`);
    if (failed.length > 0) {
      console.log(`❌ Archivos fallidos: ${failed.length}`);
    }

    console.log('⚙️ Configurando Nginx para React (dibersa.com.mx)...');
    const configCommand = `cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80;
    server_name dibersa.com.mx www.dibersa.com.mx controlobra.dibersa.com.mx 76.13.101.174;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF`;
    
    await ssh.execCommand(configCommand);
    
    console.log('🔄 Reiniciando Nginx...');
    await ssh.execCommand('systemctl restart nginx');
    await ssh.execCommand('systemctl enable nginx');

    console.log('🎉 Despliegue en VPS completado con éxito!');
    console.log('🌐 Tu aplicación está corriendo en http://76.13.101.174');

    ssh.dispose();
  } catch (error) {
    console.error('❌ Error durante el despliegue:', error);
    ssh.dispose();
    process.exit(1);
  }
}

deploy();
