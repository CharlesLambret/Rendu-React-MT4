import { MongoConnection } from '../../../../db/call';
import { ObjectId } from 'mongodb';  

export async function getAthleteById(id: string | number) {
    const client = await MongoConnection();
    const db = client.db("TP-React");
    const athletesCollection = db.collection("athletes");
    const medaillesCollection = db.collection("medailles");
    const evenementsCollection = db.collection("evenements");
    const jeuxCollection = db.collection("jeux");
    const countriesCollection = db.collection("countries");
    const sportsCollection = db.collection("sports");

    try {
        const athlete = await athletesCollection.findOne({ _id: new ObjectId(id) });
        if (!athlete) {
            return "Athlete not found.";
        }

        const [country, sport] = await Promise.all([
            countriesCollection.findOne({ _id: athlete.PaysID }),
            sportsCollection.findOne({ _id: athlete.SportID })
        ]);

        if (!country) {
            return "Country not found for the athlete.";
        }

        if (!sport) {
            return "Sport not found for the athlete.";
        }

        const medailles = await medaillesCollection.find({ AthleteID: athlete._id }).toArray();

        const detailedMedailles = await Promise.all(medailles.map(async (medaille) => {
            const evenement = await evenementsCollection.findOne({ _id: medaille.EventID });
            if (!evenement) return null;

            const jeux = await jeuxCollection.findOne({ _id: evenement.JeuxID });
            if (!jeux) return null;

            return {
                NomMedaille: medaille.NomMedaille,
                Event: evenement.NomEvent,
                Year: jeux.Annee,
                City: jeux.Ville,
                Season: jeux.Saison
            };
        }));

        athlete.totalMedailles = medailles.length;
        athlete.medailles = detailedMedailles.filter(m => m !== null); 
        athlete.Pays = country.region;
        athlete.Sport = sport.NomSport;

        delete athlete.PaysID;
        delete athlete.SportID;
        
        return athlete;
    } catch (error) {
        console.error("Failed to fetch athlete by ID:", error);
        throw error;
    } finally {
        await client.close();
    }
}

export async function searchAthletesByName(name: string) {
    const client = await MongoConnection();
    const db = client.db("TP-React");
    const athletesCollection = db.collection("athletes");
    const countriesCollection = db.collection("countries");
    const sportsCollection = db.collection("sports");

    try {
        const athletesList = await athletesCollection.find({ Nom: { $regex: name, $options: 'i' } }).toArray();
        if (athletesList.length === 0) {
            return "No athletes found.";
        }

        const detailedAthletes = await Promise.all(athletesList.map(async (athlete) => {
            const [country, sport] = await Promise.all([
                countriesCollection.findOne({ _id: athlete.PaysID }),
                sportsCollection.findOne({ _id: athlete.SportID })
            ]);

            if (country) {
                athlete.Pays = country.region;
            }

            if (sport) {
                athlete.Sport = sport.NomSport;
            }

            delete athlete.PaysID;
            delete athlete.SportID;

            return athlete;
        }));

        return detailedAthletes;
    } catch (error) {
        console.error("Failed to search athletes by name:", error);
        throw error;
    } finally {
        await client.close();
    }
}

export async function getAllAthletesLight(){
    const client = await MongoConnection();
    const db = client.db("TP-React");
    const athletesCollection = db.collection("athletes");
    const countriesCollection = db.collection("countries");
    const sportsCollection = db.collection("sports");

    try {
        const athletesList = await athletesCollection.find().toArray();
        if (athletesList.length === 0) {
            return "No athletes found.";
        }

        const detailedAthletes = await Promise.all(athletesList.map(async (athlete) => {
            const [country, sport] = await Promise.all([
                countriesCollection.findOne({ _id: athlete.PaysID }),
                sportsCollection.findOne({ _id: athlete.SportID })
            ]);

            if (country) {
                athlete.Pays = country.region;
            }

            if (sport) {
                athlete.Sport = sport.NomSport;
            }

            delete athlete.PaysID;
            delete athlete.SportID;

            return athlete;
        }));

        return detailedAthletes;
    } catch (error) {
        console.error("Failed to search athletes by name:", error);
        throw error;
    } finally {
        await client.close();
    }
}
