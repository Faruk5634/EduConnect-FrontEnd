const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const replacements = [
    // SharedMessagingModule.tsx
    { from: /<span>✏️<\/span>/g, to: '<Edit3 className="w-4 h-4" />' },
    { from: /<span>🚀<\/span>/g, to: '<Send className="w-4 h-4" />' },
    { from: />✉️<\/div>/g, to: '><Mail className="w-12 h-12" /></div>' },
    { from: />🛡️<\/span>/g, to: '><Shield className="w-3 h-3 inline-block" /></span>' },
    // SuperAdminDashboard.tsx
    { from: />🏛️</g, to: '><Building2 className="w-6 h-6" /><' },
    { from: />👨‍💼</g, to: '><Users className="w-6 h-6" /><' },
    { from: />⚙️</g, to: '><Settings className="w-6 h-6" /><' },
    { from: />✉️</g, to: '><Mail className="w-6 h-6" /><' },
    { from: />🚪</g, to: '><LogOut className="w-6 h-6" /><' },
    // ProfileTab.tsx
    { from: /><span>✉️<\/span>/g, to: '><Mail className="w-3 h-3 inline-block" /></span>' },
    { from: />✉️<\/div>/g, to: '><Mail className="w-6 h-6" /></div>' },
    // ContactTab.tsx
    { from: />✏️</g, to: '><Edit3 className="w-4 h-4" /><' },
    // SystemLogsTab.tsx
    { from: />🖨️</g, to: '><Printer className="w-4 h-4" /><' },
    // CampusManagementTab.tsx
    { from: />🏫<\/span>/g, to: '><School className="w-12 h-12 mx-auto" /></span>' },
    { from: />🏛️/g, to: '><Building2 className="w-6 h-6" />' },
    // TeacherAnnouncementManager.tsx
    { from: />🚀/g, to: '><Send className="w-4 h-4" />' },
    { from: />🗑️/g, to: '><Trash2 className="w-4 h-4" />' },
    { from: /'📢'/g, to: '<Megaphone className="w-4 h-4" />' },
    { from: /'🗂️'/g, to: '<Folder className="w-4 h-4" />' },
    // SharedAnnouncementModule.tsx
    { from: />📭<\/div>/g, to: '><div className="flex justify-center mb-6"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><Bell className="w-10 h-10 text-slate-400" /></div></div></div>' },
    // General login page
    { from: />⚠️<\/span>/g, to: '><AlertTriangle className="w-4 h-4 inline-block mr-2" /></span>' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const { from, to } of replacements) {
                if (from.test(content)) {
                    content = content.replace(from, to);
                    modified = true;
                }
            }

            if (modified) {
                // Ensure lucide-react imports exist
                const iconsToAdd = ['Edit3', 'Send', 'Mail', 'Shield', 'Building2', 'Users', 'Settings', 'LogOut', 'Printer', 'School', 'Trash2', 'Megaphone', 'Folder', 'Bell', 'AlertTriangle'];
                let importLine = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
                
                if (importLine) {
                    let existingIcons = importLine[1].split(',').map(i => i.trim());
                    let newIcons = iconsToAdd.filter(i => content.includes(`<${i}`) && !existingIcons.includes(i));
                    if (newIcons.length > 0) {
                        let newImport = `import { ${existingIcons.concat(newIcons).join(', ')} } from 'lucide-react'`;
                        content = content.replace(importLine[0], newImport);
                    }
                } else {
                    // Check if any icon is used
                    let newIcons = iconsToAdd.filter(i => content.includes(`<${i}`));
                    if (newIcons.length > 0) {
                        content = `import { ${newIcons.join(', ')} } from 'lucide-react';\n` + content;
                    }
                }
                
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Emoji replacement complete.');
