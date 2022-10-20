const Database = require('better-sqlite3')

const DBSOURCE = "db.sqlite"

function initDataBase() {

    // connect to database (will create if it doesn't exist
    let db = new Database(DBSOURCE);
    // check to see if we already initialized this database
    console.log("INFO: checking if database exists");
    
    let stmt = db.prepare(`SELECT name
        FROM sqlite_master
        WHERE
            type='table' and name='user'
        ;`);
    let row = stmt.get();
    if(row === undefined){
        console.log("WARNING: database appears empty; initializing it.");
        
        const sqlInit = `
            CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                email text UNIQUE,
                password TEXT NOT NULL,
                CONSTRAINT email_unique UNIQUE (email)
            );  

            CREATE TABLE listing (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL, 
                created_at TEXT NOT NULL, 
                price_cents INTEGER NOT NULL,
                state TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                available_since TEXT,
                available_to TEXT,
                lat REAL,
                lon REAL,
                FOREIGN KEY('user_id') REFERENCES 'user'('id') ON UPDATE NO ACTION ON DELETE CASCADE
            );

            CREATE TABLE listing_image(
                file_name TEXT NOT NULL,
                listing_id INTEGER NOT NULL, 
                FOREIGN KEY('listing_id') REFERENCES 'listing'('id') ON UPDATE NO ACTION ON DELETE CASCADE                                               
            );
            `;
        db.exec(sqlInit);
    }
}

module.exports = {
    DBSOURCE,
    initDataBase
}