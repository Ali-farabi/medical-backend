import pool from "./config/db.js";

async function createDoctorsTables() {
  try {
    console.log(" Creating doctors tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(" Specialties table created");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL,
        experience_years INTEGER DEFAULT 0,
        education TEXT,
        description TEXT,
        consultation_price DECIMAL(10, 2) DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(" Doctors table created");

    await pool.query(`
      INSERT INTO specialties (name, description, icon) 
      VALUES 
        ('Cardiology', 'Heart and cardiovascular system', ''),
        ('Neurology', 'Brain and nervous system', ''),
        ('Pediatrics', 'Children health', ''),
        ('Orthopedics', 'Bones and joints', ''),
        ('Dermatology', 'Skin conditions', ''),
        ('Ophthalmology', 'Eye care', ''),
        ('Dentistry', 'Dental care', ''),
        ('General Practice', 'General health', '')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log(" Sample specialties inserted");

    await pool.query(`
      INSERT INTO doctors (name, email, phone, specialty_id, experience_years, education, description, consultation_price, rating, reviews_count, photo)
      SELECT 
        'Dr. ' || names.name,
        lower(replace(names.name, ' ', '.')) || '@hospital.com',
        '+7 7' || LPAD((RANDOM() * 999999999)::INTEGER::TEXT, 9, '0'),
        (SELECT id FROM specialties ORDER BY RANDOM() LIMIT 1),
        (RANDOM() * 20 + 3)::INTEGER,
        'Medical University, ' || ((RANDOM() * 20 + 1990)::INTEGER)::TEXT,
        'Experienced specialist with focus on patient care and modern treatment methods.',
        (RANDOM() * 10000 + 5000)::INTEGER,
        (RANDOM() * 2 + 3)::DECIMAL(3,2),
        (RANDOM() * 100 + 10)::INTEGER,
        'https://i.pravatar.cc/300?img=' || (RANDOM() * 70)::INTEGER
      FROM (
        VALUES 
          ('Ivan Petrov'), ('Maria Ivanova'), ('Sergey Sidorov'), 
          ('Anna Kuznetsova'), ('Dmitry Volkov'), ('Elena Sokolova'),
          ('Alexander Popov'), ('Olga Fedorova'), ('Mikhail Smirnov'),
          ('Natalia Morozova')
      ) AS names(name)
      WHERE NOT EXISTS (SELECT 1 FROM doctors LIMIT 1);
    `);

    console.log(" Sample doctors inserted");
    console.log(" All tables created successfully!");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(" Error creating tables:", error);
    await pool.end();
    process.exit(1);
  }
}

createDoctorsTables();
