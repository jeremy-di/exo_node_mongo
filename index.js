const { MongoClient } = require ('mongodb');
const readline = require('readline');

const pushTheButton = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function insertProducts() {
    try {
        await client.connect();
        const database = client.db('minimarket');
        const collection = database.collection('products');

        const products = [];

        function ajouterProduit() {
            pushTheButton.question('Entrer un produit : ', (name) => {
                pushTheButton.question('Entrer le prix du produit : ', (price) => {
                    const product = {
                        name : name,
                        price : parseFloat(price)
                    };
                    products.push(product);

                    pushTheButton.question('Voulez-vous ajouter un autre produit ? (oui/non) : ', (reponse) => {
                        if ( reponse === 'oui' ) {
                            ajouterProduit();
                        } else {
                            collection.insertMany(products)
                                .then(result => {
                                    console.log("Produits ajoutés");
                                    pushTheButton.close();
                                    client.close()
                                })
                                .catch(error => console.error("Erreur au niveau de l'ajout de produits", error))
                        }
                    })
                })
            })
        }
        ajouterProduit();
    } catch (error) {
        console.error("Erreur 500 venant de la BDD")
    }
}

async function updateProducts() {
    try {
        await client.connect();
        const database = client.db('minimarket');
        const collection = database.collection('products');

        const updateResultat = await collection.updateMany({}, { $set : { disponible : true } })

        console.log("l'intégralité des produits ont été rendus disponibles.")
    } catch (error) {
        console.error("Erreur : Problème durant la mise à jour des produits")
    } finally {
        pushTheButton.close();
        await client.close();
    }
}

async function deleteProducts() {
    try {
        await client.connect();
        const database = client.db('minimarket');
        const collection = database.collection('products');

        const deleteResult = await collection.deleteMany( { price : { $lt : 10 } } );

        console.log("l'intégralité des produits en dessous de 10$ ont été supprimés du stock.")
    } catch (error) {
        console.error("Erreur : Problème durant la suppression des produits")
    } finally {
        pushTheButton.close();
        await client.close();
    }
}

function selectOptions() {
    pushTheButton.question('Quelle options voulez vous : (1 pour ajouter un produit, 2 pour affecter la disponibilité des produits, 3 pour supprimer un produit dont le prix est inferieur à 10) : :>', (reponse123) => {
        if ( reponse123 === "1" ) {
            insertProducts();
        } else if ( reponse123 === '2' ){
            updateProducts();
        } else if ( reponse123 === '3' ) {
            deleteProducts();
        } else {
            console.log('Je ne comprends pas vôtre choix')
            selectOptions();
        }
    })
}
selectOptions();
