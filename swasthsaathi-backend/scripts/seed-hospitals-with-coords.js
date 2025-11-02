// Quick seed script to add sample hospitals with lat/lng for map testing
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleHospitals = [
  {
    name: "King George's Medical University",
    address: "Shah Mina Road, Chowk, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2257540",
    type: "Government",
    beds: 1500,
    latitude: 26.8467,
    longitude: 80.9462
  },
  {
    name: "Balrampur Hospital",
    address: "Balrampur Hospital Road, Kaiser Bagh, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2620294",
    type: "Government",
    beds: 656,
    latitude: 26.8551,
    longitude: 80.9319
  },
  {
    name: "Sahara Hospital",
    address: "Viraj Khand, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-6707777",
    type: "Private",
    beds: 300,
    latitude: 26.8509,
    longitude: 81.0036
  },
  {
    name: "Medanta Hospital",
    address: "Vibhuti Khand, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-6776666",
    type: "Private",
    beds: 350,
    latitude: 26.8537,
    longitude: 80.9977
  },
  {
    name: "Apollo Medics Hospital",
    address: "Sector-B, Kanpur-Lucknow Road, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-4141000",
    type: "Private",
    beds: 250,
    latitude: 26.8398,
    longitude: 80.9189
  },
  {
    name: "Ram Manohar Lohia Hospital",
    address: "Vibhuti Khand, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2785100",
    type: "Government",
    beds: 400,
    latitude: 26.8510,
    longitude: 80.9990
  },
  {
    name: "Vivekananda Polyclinic & Institute",
    address: "Vivekananda Polyclinic Road, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2623404",
    type: "Private",
    beds: 150,
    latitude: 26.8600,
    longitude: 80.9450
  },
  {
    name: "Mayo Hospital",
    address: "Mayo Road, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2621980",
    type: "Private",
    beds: 200,
    latitude: 26.8560,
    longitude: 80.9300
  },
  {
    name: "Cloudnine Hospital",
    address: "CP-3, Viraj Khand, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-6740000",
    type: "Private",
    beds: 100,
    latitude: 26.8520,
    longitude: 80.9950
  },
  {
    name: "Charak Hospital",
    address: "Hardoi Road, Dubagga, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2725000",
    type: "Private",
    beds: 180,
    latitude: 26.8700,
    longitude: 80.9200
  },
  // Additional hospitals in different areas
  {
    name: "Lok Bandhu Hospital",
    address: "Sitapur Road, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2740000",
    type: "Private",
    beds: 120,
    latitude: 26.8800,
    longitude: 80.9500
  },
  {
    name: "Shekhar Hospital",
    address: "Indira Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "+91-522-2350000",
    type: "Private",
    beds: 90,
    latitude: 26.8400,
    longitude: 80.9800
  }
];

async function main() {
  console.log('🏥 Seeding hospitals with coordinates...');
  
  try {
    // Check if hospitals already exist
    const count = await prisma.hospital.count();
    console.log(`Found ${count} existing hospitals`);
    
    if (count > 0) {
      console.log('⚠️  Hospitals already exist. Skipping seed (or delete existing ones first).');
      const response = await new Promise((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        readline.question('Do you want to add more hospitals anyway? (yes/no): ', (answer) => {
          readline.close();
          resolve(answer.toLowerCase() === 'yes');
        });
      });
      
      if (!response) {
        console.log('❌ Cancelled');
        return;
      }
    }
    
    // Insert hospitals
    for (const hospital of sampleHospitals) {
      const result = await prisma.hospital.create({
        data: hospital
      });
      console.log(`✅ Added: ${result.name} (${result.latitude}, ${result.longitude})`);
    }
    
    console.log(`\n🎉 Successfully added ${sampleHospitals.length} hospitals!`);
    console.log('\n📍 All hospitals have lat/lng coordinates and will appear on the map.');
    
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
