const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const ejs = require('ejs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// --- KONFIGURASI DATABASE ---
// Sesuaikan dengan konfigurasi database MySQL Anda
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'gereja_db' // Pastikan nama database sama dengan yang Anda buat
};
const pool = mysql.createPool(dbConfig);


// --- FUNGSI BANTUAN ---
// Fungsi untuk merender halaman EJS
const renderPage = async (res, view, data = {}) => {
    try {
        const filePath = path.join(__dirname, 'views', ${view}.ejs);
        const renderedHtml = await ejs.renderFile(filePath, data);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderedHtml);
    } catch (error) {
        console.error(Error rendering page ${view}:, error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Terjadi kesalahan pada server.');
    }
};

// Fungsi untuk menangani request body
const getBody = (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(parse(body));
        });
    });
};


// --- SERVER UTAMA ---
const server = http.createServer(async (req, res) => {
    try {
        const url = req.url.split('?')[0]; // Abaikan query string untuk routing

        // --- STATIC FILES (CSS) ---
        if (req.method === 'GET' && url === '/style.css') {
            const cssPath = path.join(__dirname, 'public', 'style.css');
            fs.readFile(cssPath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            });
            return;
        }

        if (req.method === 'GET' && url.startsWith('/report-gereja-damai/')) {
            const filePath = path.join(__dirname, url);
            const ext = path.extname(filePath).toLowerCase();
            
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml'
            };
            
            const contentType = contentTypes[ext] || 'application/octet-stream';
            
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
            return;
}

        if (req.method === 'GET' && url.startsWith('/images/')) {
            const imagePath = path.join(__dirname, 'public', url);
            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Image Not Found');
                    return;
                }
                // Menentukan tipe konten berdasarkan ekstensi file
                const ext = path.extname(imagePath).toLowerCase();
                let contentType = 'image/jpeg'; // default
                if (ext === '.png') {
                    contentType = 'image/png';
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
            return;
        }

        if (req.method === 'GET' && url === '/script.js') {
            const jsPath = path.join(__dirname, 'public', 'script.js');
            fs.readFile(jsPath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(data);
            });
            return;
        }

        // --- ROUTING HALAMAN (GET) ---
        if (req.method === 'GET') {
            let connection;
            try {
                connection = await pool.getConnection();
                switch (url) {
                    case '/':
                        // Ambil 3 acara mendatang dari database
                        const query = `
                            SELECT * FROM events 
                            WHERE event_date >= CURDATE() 
                            ORDER BY event_date ASC, start_time ASC 
                            LIMIT 3`;
                        const [events] = await connection.execute(query);
                        
                        return renderPage(res, 'index', { events: events });
                    case '/login':
                        return renderPage(res, 'login', { error: null });
                    case '/register':
                        return renderPage(res, 'register', { error: null });
                    case '/about':
                        return renderPage(res, 'about');
                    case '/contact':
                        return renderPage(res, 'contact');
                    case '/calendar':
                        return renderPage(res, 'calendar');
                    case '/logout':
                        // Redirect ke halaman utama untuk logout
                        res.writeHead(302, { 'Location': '/' });
                        res.end();
                        return;
                    default:
                        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                        res.end('Halaman tidak ditemukan.');
                } // <-- KURUNG KURAWAL PENUTUP SWITCH DI SINI
            } finally { // <-- 'finally' SEKARANG DI POSISI YANG BENAR
                if (connection) connection.release();
            }
            return;
        }

        // --- LOGIC FORM (POST) ---
        if (req.method === 'POST') {
            let connection;
            try {
                 connection = await pool.getConnection();

                 // --- LOGIN LOGIC ---
                if (url === '/login') {
                    const { username, password } = await getBody(req);
                    
                    // Query baru dengan JOIN untuk mengambil data user dan nama perannya
                    const loginQuery = `
                        SELECT u.*, r.role_name 
                        FROM users u
                        JOIN roles r ON u.role_id = r.role_id
                        WHERE u.username = ? OR u.email = ?`;
                        
                    const [rows] = await connection.execute(loginQuery, [username, username]);

                    if (rows.length === 0) {
                        return renderPage(res, 'login', { error: 'Username atau password salah.' });
                    }

                    const user = rows[0];

                    // Cek jika akun aktif
                    if (!user.is_active) {
                        return renderPage(res, 'login', { error: 'Akun Anda tidak aktif. Silakan hubungi administrator.' });
                    }

                    // Bandingkan password yang diinput dengan hash di database
                    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

                    if (!isPasswordValid) {
                        return renderPage(res, 'login', { error: 'Username atau password salah.' });
                    }

                    // Update waktu login terakhir
                    await connection.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

                    // Tentukan dashboard berdasarkan peran (role_name)
                    if (user.role_name === 'Admin' || user.role_name === 'Super Admin') {
                        return renderPage(res, 'admin_dashboard', { user });
                    } else {
                        return renderPage(res, 'dashboard', { user });
                    }
                }

                // --- REGISTER LOGIC ---
                if (url === '/register') {
                    const { fullName, username, email, password, confirmPassword } = await getBody(req);
                    
                    if (!fullName || !username || !email || !password) {
                        return renderPage(res, 'register', { error: 'Semua kolom wajib diisi.' });
                    }

                    if (password !== confirmPassword) {
                        return renderPage(res, 'register', { error: 'Konfirmasi password tidak cocok.' });
                    }

                    // Cek apakah username atau email sudah ada
                    const [existingUsers] = await connection.execute('SELECT user_id FROM users WHERE username = ? OR email = ?', [username, email]);
                    if (existingUsers.length > 0) {
                        return renderPage(res, 'register', { error: 'Username atau email sudah terdaftar.' });
                    }

                    // Dapatkan role_id untuk 'User'
                    const [roleRows] = await connection.execute('SELECT role_id FROM roles WHERE role_name = ?', ['User']);
                    if (roleRows.length === 0) {
                        throw new Error("Role 'User' tidak ditemukan di database.");
                    }
                    const userRoleId = roleRows[0].role_id;

                    // Hash password sebelum disimpan
                    const passwordHash = await bcrypt.hash(password, 10);

                    // Simpan user baru ke database
                    await connection.execute(
                        'INSERT INTO users (full_name, username, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
                        [fullName, username, email, passwordHash, userRoleId]
                    );

                    // Redirect ke halaman login setelah berhasil registrasi dengan pesan sukses
                    res.writeHead(302, { 'Location': '/login?status=registered' });
                    res.end();
                }

            } finally {
                if (connection) connection.release();
            }
             return;
        }
        
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Halaman tidak ditemukan.');

    } catch (error) {
        console.error('Kesalahan Server:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Terjadi kesalahan pada server.');
    }
});

// --- MENJALANKAN SERVER ---
const PORT = process.env.PORT ||3000;
server.listen(PORT, () => {
    console.log(Server berjalan pada port ${PORT} -> http://localhost:${PORT}/);
    pool.getConnection()
        .then(connection => {
            console.log("Koneksi ke database MySQL berhasil.");
            connection.release();
        })
        .catch(err => {
            console.error("Gagal terkoneksi ke database MySQL:", err.message);
            console.log("Pastikan server MySQL berjalan dan konfigurasi di server.js sudah benar.");
        });
});