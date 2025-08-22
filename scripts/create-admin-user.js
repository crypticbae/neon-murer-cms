const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔐 Creating default admin user...\n');
        
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'admin@neonmurer.ch' },
                    { role: 'ADMIN' }
                ]
            }
        });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   Active: ${existingAdmin.isActive}`);
            console.log('\n💡 Use the password change function in Settings → Security to change the password.');
            return;
        }
        
        // Generate secure default password
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'NeonMurer2024!';
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
        
        // Create admin user
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@neonmurer.ch',
                password: hashedPassword,
                name: 'Administrator',
                role: 'ADMIN',
                isActive: true
            }
        });
        
        console.log('✅ Default admin user created successfully!');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   URL: /cms-admin');
        console.log('   Email: admin@neonmurer.ch');
        console.log(`   Password: ${defaultPassword}`);
        console.log('');
        console.log('🔒 IMPORTANT SECURITY NOTES:');
        console.log('1. Change the default password immediately after first login');
        console.log('2. Go to Settings → Security → Password Change');
        console.log('3. Use a strong password with at least 12 characters');
        console.log('4. Consider changing the admin email to your own');
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('1. Login to the admin panel');
        console.log('2. Change the default password');
        console.log('3. Configure your website settings');
        console.log('4. Upload your media files');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        
        if (error.code === 'P2002') {
            console.log('💡 Admin user may already exist. Check your database.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    createAdminUser();
}

module.exports = createAdminUser;
