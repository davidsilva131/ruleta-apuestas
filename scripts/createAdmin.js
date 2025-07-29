const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (existingAdmin) {
      console.log('❌ Ya existe un usuario administrador:', existingAdmin.username);
      return;
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@ruleta.com',
        password: hashedPassword,
        balance: 0, // Los administradores no tienen saldo
        isAdmin: true,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   Username: admin');
    console.log('   Email: admin@ruleta.com');
    console.log('   Password: admin123');
    console.log('   Balance: $0 (Administradores no tienen saldo)');
    console.log('   Admin: true');

    // También crear un usuario normal de prueba
    const normalUserPassword = await bcrypt.hash('user123', 10);
    const normalUser = await prisma.user.create({
      data: {
        username: 'usuario',
        email: 'user@ruleta.com',
        password: normalUserPassword,
        balance: 10000,
        isAdmin: false,
      },
    });

    console.log('');
    console.log('✅ Usuario normal creado exitosamente:');
    console.log('   Username: usuario');
    console.log('   Email: user@ruleta.com');
    console.log('   Password: user123');
    console.log('   Balance: $10,000');
    console.log('   Admin: false');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
