import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import { Photo } from "./models/photo";
import { Resolution } from "./models/resolution";

export default function MyConnection() : Promise<Connection> {
    return createConnection({
        type: "mysql",
        host: "localhost",
        port: 3306,
        insecureAuth: true,
        username: "root",
        password: "my-Pa$$word",
        database: "typeOrm",
        entities: [
            Photo,
            Resolution
        ],
        synchronize: true,
        logging: false
    });
}


(async function() {
    try {
        await MyConnection();
        console.log('Success');
    }catch(error) {
        console.log(error);    
    }    
})
