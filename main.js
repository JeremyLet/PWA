// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Simple/service-worker.js') // Ajoute '/Simple/' au chemin
            .then(registration => {
                // console.log('Service Worker enregistré avec succès :', registration);
            })
            .catch(error => {
                console.error('Échec de l\'enregistrement du Service Worker :', error);
            });
    });
}

// Lorsque l'utilisateur clique sur "Enregistrer"
document.getElementById('saveUsername').addEventListener('click', function () {
    const username = document.getElementById('username').value; // Récupérer le nom d'utilisateur

    if (username) {
        // Enregistrer le nom d'utilisateur dans localStorage
        localStorage.setItem('username', username);

        // Afficher la section du formulaire
        document.getElementById('userSection').style.display = 'none';
        document.getElementById('formSection').style.display = 'block';
    } else {
        alert('Veuillez entrer un nom d\'utilisateur');
    }
});

// Vérifier si un nom d'utilisateur est déjà stocké
window.addEventListener('load', function () {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        // Si un nom d'utilisateur est déjà stocké, cacher la section de l'utilisateur et afficher le formulaire
        document.getElementById('userSection').style.display = 'none';
        document.getElementById('formSection').style.display = 'block';
    }
});

// Fonction pour enregistrer les données localement
function saveDataOffline(data) {
    let offlineData = JSON.parse(localStorage.getItem('offlineData')) || [];
    offlineData.push(data); // Ajouter les nouvelles données à la liste
    localStorage.setItem('offlineData', JSON.stringify(offlineData)); // Sauvegarder dans localStorage
    console.log('Données enregistrées hors ligne :', data);
}

// Fonction pour envoyer les données stockées hors ligne
function syncOfflineData() {
    let offlineData = JSON.parse(localStorage.getItem('offlineData')) || [];
    if (offlineData.length > 0) {
        console.log('Synchronisation des données hors ligne...');

        // Envoyer chaque élément au serveur
        offlineData.forEach(data => {
            fetch('https://hook.eu2.make.com/ktmojt6picuwoejgj95s68bylum5p7nc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.text())
                .then(text => {
                    if (text === "Accepted") {
                        console.log('Données synchronisées avec succès :', data);
                        offlineData = offlineData.filter(d => d !== data); // Supprimer les données synchronisées
                        localStorage.setItem('offlineData', JSON.stringify(offlineData)); // Mettre à jour le stockage local
                    } else {
                        console.warn('Échec de la synchronisation pour :', data, 'Réponse serveur :', text);
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la synchronisation :', error);
                });
        });
    }
}

// Écouter le retour en ligne pour synchroniser les données
window.addEventListener('online', syncOfflineData);

// Fonction pour mettre à jour l'état du réseau
function updateNetworkStatus() {
    const networkStatusElement = document.getElementById('networkStatus');
    if (navigator.onLine) {
        networkStatusElement.textContent = 'En ligne';
        networkStatusElement.classList.remove('text-red-600');
        networkStatusElement.classList.add('text-green-600');
    } else {
        networkStatusElement.textContent = 'Hors ligne';
        networkStatusElement.classList.remove('text-green-600');
        networkStatusElement.classList.add('text-red-600');
    }
}

// Initialiser l'état réseau
updateNetworkStatus();

// Écouter les événements de changement d'état réseau
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêche la soumission classique

    const form = this;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const username = localStorage.getItem('username');
    if (username) {
        data.username = username;
    }

    const messageContainer = document.getElementById('messageContainer');

    // Vérifier l'état du réseau
    if (navigator.onLine) {
        // Si le réseau est en ligne, envoyer les données via fetch
        fetch('https://hook.eu2.make.com/ktmojt6picuwoejgj95s68bylum5p7nc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.text())
            .then(text => {
                if (text === "Accepted") {
                    messageContainer.textContent = 'Données envoyées avec succès.';
                    messageContainer.classList.remove('hidden', 'text-red-600');
                    messageContainer.classList.add('text-green-600');
                    console.log('Données envoyées avec succès');
                } else {
                    messageContainer.textContent = 'Erreur serveur. Les données pourraient ne pas être envoyées.';
                    messageContainer.classList.remove('hidden', 'text-green-600');
                    messageContainer.classList.add('text-red-600');
                    console.warn('Réponse inattendue du serveur :', text);
                }
            })
            .catch(error => {
                messageContainer.textContent = 'Erreur lors de l\'envoi des données. Elles ont été sauvegardées localement.';
                messageContainer.classList.remove('hidden', 'text-green-600');
                messageContainer.classList.add('text-red-600');
                saveDataOffline(data);
                console.error('Erreur lors de l\'envoi des données :', error);
            });
    } else {
        // Sauvegarde des données hors ligne
        saveDataOffline(data);
        messageContainer.textContent = 'Vous êtes hors ligne. Les données ont été sauvegardées localement.';
        messageContainer.classList.remove('hidden', 'text-green-600');
        messageContainer.classList.add('text-yellow-600');
    }

    // Afficher le message après soumission
    messageContainer.classList.remove('hidden');

    // Après 3 secondes, réinitialiser le formulaire et cacher le message
    setTimeout(() => {
        form.reset();
        messageContainer.classList.add('hidden'); // Cacher le message après 3 secondes
    }, 3000); // Temps de 3 secondes
});

