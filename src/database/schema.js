import pool from "../config/db.js";

export const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Users table ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Specialties table ready");

    const { rows } = await pool.query("SELECT COUNT(*) FROM specialties");
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO specialties (name, description, icon) VALUES
        ('Cardiology', 'Heart and cardiovascular system', 'heart'),
        ('Neurology', 'Brain and nervous system', 'brain'),
        ('Pediatrics', 'Medical care for children', 'baby'),
        ('Orthopedics', 'Bones, joints, and muscles', 'bone'),
        ('Dermatology', 'Skin, hair, and nails', 'skin'),
        ('Ophthalmology', 'Eyes and vision', 'eye'),
        ('Psychiatry', 'Mental health', 'mental'),
        ('General Practice', 'General medical care', 'hospital'),
        ('Dentistry', 'Dental and oral care', 'tooth'),
        ('ENT', 'Ear, nose, and throat', 'ear')
      `);
      console.log("✓ Default specialties inserted");
    }

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
        photo TEXT,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Doctors table ready");

    const doctorsResult = await pool.query("SELECT COUNT(*) FROM doctors");
    if (parseInt(doctorsResult.rows[0].count) === 0) {
      await pool.query(
        `
        INSERT INTO doctors (name, email, phone, specialty_id, experience_years, education, description, consultation_price, photo, rating, reviews_count) 
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
        ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22),
        ($23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33),
        ($34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44),
        ($45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55),
        ($56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66),
        ($67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77),
        ($78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88)
      `,
        [
          "Dr. Aibek Nuranov",
          "aibek.nuranov@hospital.kz",
          "+7 777 123 4567",
          1,
          15,
          "Kazakh National Medical University",
          "Experienced cardiologist specializing in interventional cardiology and heart disease prevention",
          8000,
          "https://i.pravatar.cc/300?img=12",
          4.8,
          145,
          "Dr. Saule Bekenova",
          "saule.bekenova@hospital.kz",
          "+7 777 234 5678",
          3,
          10,
          "Astana Medical University",
          "Pediatrician with focus on child development and preventive care",
          6000,
          "https://i.pravatar.cc/300?img=45",
          4.9,
          203,
          "Dr. Marat Zhanatov",
          "marat.zhanatov@hospital.kz",
          "+7 777 345 6789",
          2,
          12,
          "Semey Medical University",
          "Neurologist specializing in epilepsy and movement disorders",
          7500,
          "https://i.pravatar.cc/300?img=33",
          4.7,
          98,
          "Dr. Aigerim Kasymova",
          "aigerim.kasymova@hospital.kz",
          "+7 777 456 7890",
          5,
          8,
          "Karaganda Medical University",
          "Dermatologist with expertise in cosmetic dermatology",
          5500,
          "https://i.pravatar.cc/300?img=47",
          4.6,
          156,
          "Dr. Yerlan Suleimenov",
          "yerlan.suleimenov@hospital.kz",
          "+7 777 567 8901",
          4,
          20,
          "Kazakh National Medical University",
          "Orthopedic surgeon specializing in sports medicine",
          9000,
          "https://i.pravatar.cc/300?img=15",
          4.9,
          187,
          "Dr. Dana Akhmetova",
          "dana.akhmetova@hospital.kz",
          "+7 777 678 9012",
          6,
          14,
          "Almaty Medical University",
          "Ophthalmologist with expertise in laser eye surgery",
          7000,
          "https://i.pravatar.cc/300?img=28",
          4.8,
          167,
          "Dr. Timur Bekmuratov",
          "timur.bekmuratov@hospital.kz",
          "+7 777 789 0123",
          7,
          9,
          "Aktobe Medical University",
          "Psychiatrist specializing in anxiety and depression treatment",
          6500,
          "https://i.pravatar.cc/300?img=51",
          4.7,
          124,
          "Dr. Zhanna Omarova",
          "zhanna.omarova@hospital.kz",
          "+7 777 890 1234",
          8,
          18,
          "Kokshetau Medical University",
          "General practitioner with holistic approach to healthcare",
          5000,
          "https://i.pravatar.cc/300?img=44",
          4.9,
          289,
        ]
      );
      console.log("✓ Sample doctors inserted");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(" Appointments table ready");

    console.log(" All tables created successfully!");
  } catch (error) {
    console.error(" Error creating tables:", error);
    throw error;
  }
};
