import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB1qWP8M3jEauxL1QzCOz-zb-kI9MumwyY",
    authDomain: "votaciononline-502dd.firebaseapp.com",
    databaseURL: "https://votaciononline-502dd-default-rtdb.firebaseio.com",
    projectId: "votaciononline-502dd",
    storageBucket: "votaciononline-502dd.appspot.com",
    messagingSenderId: "223964095350",
    appId: "1:223964095350:web:6db96fb5b4fa8bd5895057"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDot = document.getElementById('notificationDot');
    const notificationModal = document.getElementById('notificationModal');
    const proposalsModal = document.getElementById('proposalsModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const proposalsTableBody = document.getElementById('proposalsTableBody');
    const closeProposalsModal = document.getElementById('closeProposalsModal');

    // Función para mostrar/ocultar el punto de notificación
    function toggleNotificationDot(show) {
        if (notificationDot) {
            notificationDot.classList.toggle('hidden', !show);
        }
    }

    // Función para mostrar/ocultar el modal de notificaciones
    function toggleNotificationModal() {
        notificationModal.classList.toggle('hidden');
    }

    // Función para mostrar/ocultar el modal de propuestas
    function toggleProposalsModal() {
        proposalsModal.classList.toggle('hidden');
    }

    // Función para cargar las propuestas en la tabla
    function loadProposals() {
        const proposalsRef = ref(db, 'propuestas');
        get(proposalsRef).then((snapshot) => {
            if (snapshot.exists()) {
                proposalsTableBody.innerHTML = '';
                snapshot.forEach((childSnapshot) => {
                    const proposal = childSnapshot.val();
                    const proposalKey = childSnapshot.key;
                    if (proposal.estado === 'pendiente') {
                        const row = `
                            <tr data-key="${proposalKey}">
                                <td class="px-6 py-4 whitespace-nowrap">${proposal.usuario}</td>
                                <td class="px-6 py-4">${proposal.propuesta}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <button class="approve-btn text-green-600 hover:text-green-900 mr-2">Aprobar</button>
                                    <button class="deny-btn text-red-600 hover:text-red-900">Denegar</button>
                                </td>
                            </tr>
                        `;
                        proposalsTableBody.innerHTML += row;
                    }
                });
                if (proposalsTableBody.innerHTML === '') {
                    proposalsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No hay propuestas pendientes</td></tr>';
                }
            } else {
                proposalsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No hay propuestas disponibles</td></tr>';
            }
        }).catch((error) => {
            console.error("Error al cargar las propuestas:", error);
        });
    }

    // Event Listeners
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationModal);
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUser').value;
            const password = document.getElementById('adminPassword').value;
            
            const adminRef = ref(db, 'admin');
            get(adminRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const adminData = snapshot.val();
                    if (username === adminData.user && password === adminData.contrasena) {
                        toggleNotificationModal();
                        toggleProposalsModal();
                        loadProposals();
                    } else {
                        alert('Credenciales incorrectas');
                    }
                }
            }).catch((error) => {
                console.error("Error al verificar las credenciales:", error);
            });
        });
    }

    if (closeProposalsModal) {
        closeProposalsModal.addEventListener('click', toggleProposalsModal);
    }

    // Función para verificar propuestas no leídas
    function checkUnreadProposals() {
        const proposalsRef = ref(db, 'propuestas');
        get(proposalsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const hasUnreadProposals = Object.values(snapshot.val()).some(proposal => !proposal.leida && proposal.estado === 'pendiente');
                toggleNotificationDot(hasUnreadProposals);
            } else {
                toggleNotificationDot(false);
            }
        }).catch((error) => {
            console.error("Error al verificar propuestas no leídas:", error);
        });
    }

    // Escuchar cambios en las propuestas para actualizar el punto de notificación
    const proposalsRef = ref(db, 'propuestas');
    onValue(proposalsRef, (snapshot) => {
        checkUnreadProposals();
    });

    if (proposalsTableBody) {
        proposalsTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('approve-btn') || e.target.classList.contains('deny-btn')) {
                const row = e.target.closest('tr');
                const proposalKey = row.getAttribute('data-key');
                const action = e.target.classList.contains('approve-btn') ? 'aprobada' : 'denegada';
                const proposalText = row.cells[1].textContent; // Asumiendo que la propuesta está en la segunda celda
    
                // Actualizar el estado de la propuesta en la base de datos
                const proposalRef = ref(db, `propuestas/${proposalKey}`);
                update(proposalRef, {
                    estado: action,
                    leida: true
                }).then(() => {
                    if (action === 'aprobada') {
                        // Guardar la propuesta aprobada en sessionStorage y redirigir
                        sessionStorage.setItem('approvedProposal', proposalText);
                        window.location.href = 'administracion.html';
                    } else {
                        row.remove();
                        if (proposalsTableBody.children.length === 0) {
                            proposalsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No hay propuestas pendientes</td></tr>';
                        }
                    }
                    checkUnreadProposals();
                }).catch((error) => {
                    console.error("Error al actualizar la propuesta:", error);
                });
            }
        });
    }
        });
   
// Funcionalidad para votacion.html
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const noVotingSection = document.getElementById('noVotingSection');
const votingSection = document.getElementById('votingSection');
const votingTitle = document.getElementById('votingTitle');
const votingDescription = document.getElementById('votingDescription');
const voteYes = document.getElementById('voteYes');
const voteNo = document.getElementById('voteNo');
const voteAbstain = document.getElementById('voteAbstain');
const submitVote = document.getElementById('submitVote');

let currentUser = null;
let selectedVote = null;

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;

        const userRef = ref(db, `usuarios/${userId}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userPassword === userData.contrasena) {
                    currentUser = userId;
                    checkVotingStatus(userData);
                } else {
                    alert('Contraseña incorrecta.');
                }
            } else {
                alert('Usuario no encontrado.');
            }
        }).catch((error) => {
            console.error("Error al verificar el usuario:", error);
        });
    });
}

function checkVotingStatus(userData) {
    const votingRef = ref(db, 'votacion/dequetrata');
    get(votingRef).then((snapshot) => {
        if (snapshot.exists()) {
            const votingData = snapshot.val();
            if (votingData.titulo === 'No hay datos') {
                showNoVotingSection();
            } else if (votingData.votacionFinalizada) {
                alert('La votación ha finalizado. Ya no se pueden emitir más votos.');
                showNoVotingSection();
            } else if (userData.havotado) {
                alert('Usted ya ha votado en esta votación.');
            } else {
                showVotingSection(votingData);
            }
        } else {
            showNoVotingSection();
        }
    }).catch((error) => {
        console.error("Error al verificar el estado de la votación:", error);
    });
}


function showNoVotingSection() {
    loginSection.classList.add('hidden');
    votingSection.classList.add('hidden');
    noVotingSection.classList.remove('hidden');
}

function showVotingSection(votingData) {
    loginSection.classList.add('hidden');
    noVotingSection.classList.add('hidden');
    votingSection.classList.remove('hidden');
    votingTitle.textContent = votingData.titulo;
    votingDescription.textContent = votingData.subtitulo;
}

[voteYes, voteNo, voteAbstain].forEach(button => {
    if (button) {
        button.addEventListener('click', () => {
            selectedVote = button.id.replace('vote', '').toLowerCase();
            [voteYes, voteNo, voteAbstain].forEach(btn => btn.classList.remove('bg-blue-500'));
            button.classList.add('bg-blue-500');
        });
    }
});

if (submitVote) {
    submitVote.addEventListener('click', () => {
        if (!selectedVote) {
            alert('Por favor, seleccione una opción de voto.');
            return;
        }

        let voteField;
        switch(selectedVote.toLowerCase()) {
            case 'yes':
                voteField = 'si';
                break;
            case 'no':
                voteField = 'no';
                break;
            case 'abstain':
                voteField = 'abstencion';
                break;
        }

        const voteRef = ref(db, `votacion/${voteField}`);
        const userRef = ref(db, `usuarios/${currentUser}`);

        get(voteRef).then((snapshot) => {
            const currentVotes = snapshot.val() || 0;
            const updates = {};
            updates[`votacion/${voteField}`] = currentVotes + 1;
            updates[`usuarios/${currentUser}/havotado`] = true;

            update(ref(db), updates)
                .then(() => {
                    alert('Su voto ha sido registrado.');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error al registrar el voto:", error);
                });
        }).catch((error) => {
            console.error("Error al obtener los votos actuales:", error);
        });
    });
}


// Funcionalidad para registro.html
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginSection = document.getElementById('adminLoginSection');
const userRegistrationSection = document.getElementById('userRegistrationSection');
const userRegistrationForm = document.getElementById('userRegistrationForm');
const editUsersBtn = document.getElementById('editUsersBtn');
const editUsersModal = document.getElementById('editUsersModal');
const closeEditUsersModal = document.getElementById('closeEditUsersModal');
const userTableBody = document.getElementById('userTableBody');
const editUserModal = document.getElementById('editUserModal');
const editUserForm = document.getElementById('editUserForm');
const closeEditUserModal = document.getElementById('closeEditUserModal');

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminUser = document.getElementById('adminUser').value;
        const adminPassword = document.getElementById('adminPassword').value;

        const adminRef = ref(db, 'admin');
        get(adminRef).then((snapshot) => {
            if (snapshot.exists()) {
                const adminData = snapshot.val();
                if (adminUser === adminData.user && adminPassword === adminData.contrasena) {
                    adminLoginSection.classList.add('hidden');
                    userRegistrationSection.classList.remove('hidden');
                    editUsersBtn.classList.remove('hidden');
                } else {
                    alert('Credenciales de administrador incorrectas.');
                }
            } else {
                alert('Error al verificar las credenciales de administrador.');
            }
        }).catch((error) => {
            console.error("Error al verificar las credenciales de administrador:", error);
        });
    });
}

if (userRegistrationForm) {
    userRegistrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = document.getElementById('userName').value;
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;
        const userRole = document.getElementById('userRole').value;
        const userBio = document.getElementById('userBio').value;

        const userRef = ref(db, `usuarios/${userId}`);
        set(userRef, {
            nombre: userName,
            contrasena: userPassword,
            rol: userRole,
            bibliografia: userBio,
            havotado: false
        }).then(() => {
            alert('Usuario registrado exitosamente.');
            userRegistrationForm.reset();
        }).catch((error) => {
            console.error("Error al registrar el usuario:", error);
            alert('Error al registrar el usuario.');
        });
    });
}

if (editUsersBtn) {
    editUsersBtn.addEventListener('click', () => {
        editUsersModal.classList.remove('hidden');
        loadUsers();
    });
}

if (closeEditUsersModal) {
    closeEditUsersModal.addEventListener('click', () => {
        editUsersModal.classList.add('hidden');
    });
}

function loadUsers() {
    const usersRef = ref(db, 'usuarios');
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            userTableBody.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const userId = childSnapshot.key;
                const userData = childSnapshot.val();
                const row = `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${userData.nombre}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${userId}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${userData.rol}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button class="edit-user-btn text-blue-600 hover:text-blue-900 mr-2" data-userid="${userId}">Editar</button>
                            <button class="delete-user-btn text-red-600 hover:text-red-900" data-userid="${userId}">Eliminar</button>
                        </td>
                    </tr>
                `;
                userTableBody.innerHTML += row;
            });
        } else {
            userTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No hay usuarios registrados</td></tr>';
        }
    }).catch((error) => {
        console.error("Error al cargar los usuarios:", error);
    });
}

if (userTableBody) {
    userTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-user-btn')) {
            const userId = e.target.getAttribute('data-userid');
            openEditUserModal(userId);
        } else if (e.target.classList.contains('delete-user-btn')) {
            const userId = e.target.getAttribute('data-userid');
            if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userId}?`)) {
                const userRef = ref(db, `usuarios/${userId}`);
                remove(userRef).then(() => {
                    alert('Usuario eliminado exitosamente.');
                    loadUsers();
                }).catch((error) => {
                    console.error("Error al eliminar el usuario:", error);
                    alert('Error al eliminar el usuario.');
                });
            }
        }
    });
}

function openEditUserModal(userId) {
    const userRef = ref(db, `usuarios/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUserName').value = userData.nombre;
            document.getElementById('editUserPassword').value = userData.contrasena;
            document.getElementById('editUserRole').value = userData.rol;
            editUserModal.classList.remove('hidden');
        } else {
            alert('Usuario no encontrado');
        }
    }).catch((error) => {
        console.error("Error al obtener datos del usuario:", error);
    });
}

if (closeEditUserModal) {
    closeEditUserModal.addEventListener('click', () => {
        editUserModal.classList.add('hidden');
    });
}

if (editUserForm) {
    editUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('editUserId').value;
        const updatedUserData = {
            nombre: document.getElementById('editUserName').value,
            contrasena: document.getElementById('editUserPassword').value,
            rol: document.getElementById('editUserRole').value
        };

        const userRef = ref(db, `usuarios/${userId}`);
        update(userRef, updatedUserData).then(() => {
            alert('Usuario actualizado exitosamente');
            editUserModal.classList.add('hidden');
            loadUsers(); // Recargar la lista de usuarios
        }).catch((error) => {
            console.error("Error al actualizar el usuario:", error);
            alert('Error al actualizar el usuario');
        });
    });
}
// Funcionalidad para administracion.html
const approvedProposalMessage = document.getElementById('approvedProposalMessage');
const adminLoginFormAdmin = document.getElementById('adminLoginForm');
const loginSectionAdmin = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const currentVotingInfo = document.getElementById('currentVotingInfo');
const createNewVotingBtn = document.getElementById('createNewVotingBtn');
const deleteVotingBtn = document.getElementById('deleteVotingBtn');
const showApprovedProposalsBtn = document.getElementById('showApprovedProposalsBtn');
const createVotingModal = document.getElementById('createVotingModal');
const createVotingForm = document.getElementById('createVotingForm');
const closeCreateVotingModal = document.getElementById('closeCreateVotingModal');
const approvedProposalsModal = document.getElementById('approvedProposalsModal');
const approvedProposalsList = document.getElementById('approvedProposalsList');
const closeApprovedProposalsModal = document.getElementById('closeApprovedProposalsModal');


if (adminLoginFormAdmin) {
    adminLoginFormAdmin.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminUser = document.getElementById('adminUser').value;
        const adminPassword = document.getElementById('adminPassword').value;

        const adminRef = ref(db, 'admin');
        get(adminRef).then((snapshot) => {
            if (snapshot.exists()) {
                const adminData = snapshot.val();
                if (adminUser === adminData.user && adminPassword === adminData.contrasena) {
                    loginSectionAdmin.classList.add('hidden');
                    adminPanel.classList.remove('hidden');
                    loadCurrentVotingInfo();
                } else {
                    alert('Credenciales de administrador incorrectas.');
                }
            } else {
                alert('Error al verificar las credenciales de administrador.');
            }
        }).catch((error) => {
            console.error("Error al verificar las credenciales de administrador:", error);
        });
    });
}

function loadCurrentVotingInfo() {
    const votingRef = ref(db, 'votacion/dequetrata');
    get(votingRef).then((snapshot) => {
        if (snapshot.exists()) {
            const votingData = snapshot.val();
            currentVotingInfo.innerHTML = `
                <p><strong>Título:</strong> ${votingData.titulo}</p>
                <p><strong>Descripción:</strong> ${votingData.subtitulo}</p>
            `;
        } else {
            currentVotingInfo.innerHTML = '<p>No hay votación activa actualmente.</p>';
        }
    }).catch((error) => {
        console.error("Error al cargar la información de la votación:", error);
    });
}

if (createNewVotingBtn) {
    createNewVotingBtn.addEventListener('click', () => {
        createVotingModal.classList.remove('hidden');
    });
}

if (closeCreateVotingModal) {
    closeCreateVotingModal.addEventListener('click', () => {
        createVotingModal.classList.add('hidden');
    });
}

if (createVotingForm) {
    createVotingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('votingTitle').value;
        const description = document.getElementById('votingDescription').value;

        const votingRef = ref(db, 'votacion');
        set(votingRef, {
            dequetrata: {
                titulo: title,
                subtitulo: description,
                codigo: '',
                codigousado: false,
                generacion: false,
                votacionFinalizada: false
            },
            si: 0,
            no: 0,
            abstencion: 0
        }).then(() => {
            alert('Nueva votación creada exitosamente.');
            createVotingModal.classList.add('hidden');
            loadCurrentVotingInfo();
            resetUserVotingStatus();
        }).catch((error) => {
            console.error("Error al crear la nueva votación:", error);
            alert('Error al crear la nueva votación.');
        });
    });
}


if (deleteVotingBtn) {
    deleteVotingBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar la votación actual?')) {
            const votingRef = ref(db, 'votacion');
            set(votingRef, {
                dequetrata: {
                    titulo: 'No hay datos',
                    subtitulo: 'No hay datos',
                    codigo: '',
                    codigousado: false,
                    generacion: false,
                    votacionFinalizada: false
                },
                si: 0,
                no: 0,
                abstencion: 0
            }).then(() => {
                alert('Votación borrada exitosamente.');
                loadCurrentVotingInfo();
                resetUserVotingStatus();
            }).catch((error) => {
                console.error("Error al borrar la votación:", error);
                alert('Error al borrar la votación.');
            });
        }
    });
}
// Dentro del event listener DOMContentLoaded o donde inicializas la página de administración
if (approvedProposalMessage) {
    const approvedProposal = sessionStorage.getItem('approvedProposal');
    if (approvedProposal) {
        approvedProposalMessage.innerHTML = `
            <p><strong>Usted aprobó la propuesta:</strong> "${approvedProposal}"</p>
            <p>Cree la votación para que los usuarios voten.</p>
        `;
        approvedProposalMessage.classList.remove('hidden');
        sessionStorage.removeItem('approvedProposal'); // Limpiar después de mostrar
    }
}

// Modifica la función de crear nueva votación para usar la propuesta aprobada si está disponible
if (createVotingForm) {
    createVotingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('votingTitle').value;
        const description = document.getElementById('votingDescription').value || sessionStorage.getItem('approvedProposal') || '';

        const votingRef = ref(db, 'votacion');
        set(votingRef, {
            dequetrata: {
                titulo: title,
                subtitulo: description,
                codigo: '',
                codigousado: false,
                generacion: false,
                votacionFinalizada: false
            },
            si: 0,
            no: 0,
            abstencion: 0
        }).then(() => {
            alert('Nueva votación creada exitosamente.');
            createVotingModal.classList.add('hidden');
            loadCurrentVotingInfo();
            resetUserVotingStatus();
            approvedProposalMessage.classList.add('hidden'); // Ocultar el mensaje después de crear la votación
            sessionStorage.removeItem('approvedProposal'); // Limpiar la propuesta aprobada
        }).catch((error) => {
            console.error("Error al crear la nueva votación:", error);
            alert('Error al crear la nueva votación.');
        });
    });
}

function resetUserVotingStatus() {
    const usersRef = ref(db, 'usuarios');
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const updates = {};
            snapshot.forEach((childSnapshot) => {
                updates[`${childSnapshot.key}/havotado`] = false;
            });
            update(usersRef, updates).then(() => {
                console.log('Estado de votación de usuarios reiniciado.');
            }).catch((error) => {
                console.error("Error al reiniciar el estado de votación de los usuarios:", error);
            });
        }
    }).catch((error) => {
        console.error("Error al obtener los usuarios:", error);
    });
}

if (showApprovedProposalsBtn) {
    showApprovedProposalsBtn.addEventListener('click', () => {
        loadApprovedProposals();
        approvedProposalsModal.classList.remove('hidden');
    });
}

if (closeApprovedProposalsModal) {
    closeApprovedProposalsModal.addEventListener('click', () => {
        approvedProposalsModal.classList.add('hidden');
    });
}

function loadApprovedProposals() {
    const proposalsRef = ref(db, 'propuestas');
    get(proposalsRef).then((snapshot) => {
        if (snapshot.exists()) {
            let approvedProposalsHTML = '';
            snapshot.forEach((childSnapshot) => {
                const proposal = childSnapshot.val();
                if (proposal.estado === 'aprobada') {
                    approvedProposalsHTML += `
                        <div class="bg-gray-100 p-4 mb-4 rounded-lg">
                            <p><strong>Usuario:</strong> ${proposal.usuario}</p>
                            <p><strong>Propuesta:</strong> ${proposal.propuesta}</p>
                        </div>
                    `;
                }
            });
            approvedProposalsList.innerHTML = approvedProposalsHTML || '<p>No hay propuestas aprobadas.</p>';
        } else {
            approvedProposalsList.innerHTML = '<p>No hay propuestas disponibles.</p>';
        }
    }).catch((error) => {
        console.error("Error al cargar las propuestas aprobadas:", error);
    });
}


// Funcionalidad para perfil.html
const profileFunctionality = {
    init: function() {
        this.userLoginFormProfile = document.getElementById('userLoginForm');
        this.loginSectionProfile = document.getElementById('loginSection');
        this.userProfileSection = document.getElementById('userProfileSection');
        this.userName = document.getElementById('userName');
        this.userRole = document.getElementById('userRole');
        this.userBio = document.getElementById('userBio');
        this.changePasswordForm = document.getElementById('changePasswordForm');
        this.proposalForm = document.getElementById('proposalForm');
        this.viewProposalsBtn = document.getElementById('viewProposalsBtn');
        this.proposalsModal = document.getElementById('proposalsModal');
        this.proposalsList = document.getElementById('proposalsList');
        this.closeProposalsModal = document.getElementById('closeProposalsModal');

        this.currentUser = null;

        this.attachEventListeners();
    },

    attachEventListeners: function() {
        if (this.userLoginFormProfile) {
            this.userLoginFormProfile.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.changePasswordForm) {
            this.changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        if (this.proposalForm) {
            this.proposalForm.addEventListener('submit', (e) => this.handleProposalSubmission(e));
        }

        if (this.viewProposalsBtn) {
            this.viewProposalsBtn.addEventListener('click', () => this.handleViewProposals());
        }

        if (this.closeProposalsModal) {
            this.closeProposalsModal.addEventListener('click', () => this.handleCloseProposalsModal());
        }
    },

    handleLogin: function(e) {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;

        const userRef = ref(db, `usuarios/${userId}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userPassword === userData.contrasena) {
                    this.currentUser = userId;
                    this.loginSectionProfile.classList.add('hidden');
                    this.userProfileSection.classList.remove('hidden');
                    this.loadUserProfile(userId, userData);
                } else {
                    alert('Contraseña incorrecta.');
                }
            } else {
                alert('Usuario no encontrado.');
            }
        }).catch((error) => {
            console.error("Error al verificar el usuario:", error);
        });
    },

    loadUserProfile: function(userId, userData) {
        this.userName.textContent = `Hola, ${userData.nombre}`;
        this.userRole.textContent = userData.rol;
        this.userBio.textContent = userData.bibliografia || 'No hay biografía disponible.';
    },

    handleChangePassword: function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const userRef = ref(db, `usuarios/${this.currentUser}`);
        update(userRef, { contrasena: newPassword })
            .then(() => {
                alert('Contraseña actualizada exitosamente.');
                this.changePasswordForm.reset();
            })
            .catch((error) => {
                console.error("Error al actualizar la contraseña:", error);
                alert('Error al actualizar la contraseña.');
            });
    },

    handleProposalSubmission: function(e) {
        e.preventDefault();
        const proposalText = document.getElementById('proposalText').value;

        const proposalRef = ref(db, `propuestas/${this.currentUser}_${Date.now()}`);
        set(proposalRef, {
            usuario: this.currentUser,
            propuesta: proposalText,
            estado: 'pendiente',
            timestamp: Date.now()
        }).then(() => {
            alert('Propuesta enviada exitosamente.');
            this.proposalForm.reset();
        }).catch((error) => {
            console.error("Error al enviar la propuesta:", error);
            alert('Error al enviar la propuesta.');
        });
    },

    handleViewProposals: function() {
        this.loadUserProposals();
        if (this.proposalsModal) {
            this.proposalsModal.classList.remove('hidden');
        }
    },

    handleCloseProposalsModal: function() {
        console.log('Intentando cerrar el modal');
        if (this.proposalsModal) {
            console.log('Modal encontrado, cerrando...');
            this.proposalsModal.classList.add('hidden');
        } else {
            console.log('Modal no encontrado');
        }
    },
    handleCloseProposalsModal: function() {
        console.log('Intentando cerrar el modal');
        if (this.proposalsModal) {
            console.log('Modal encontrado, cerrando...');
            this.proposalsModal.classList.add('hidden');
        } else {
            console.log('Modal no encontrado');
        }
    },

    loadUserProposals: function() {
        const proposalsRef = ref(db, 'propuestas');
        get(proposalsRef).then((snapshot) => {
            if (snapshot.exists()) {
                let proposalsHTML = '';
                snapshot.forEach((childSnapshot) => {
                    const proposal = childSnapshot.val();
                    if (proposal.usuario === this.currentUser) {
                        proposalsHTML += `
                            <div class="bg-gray-100 p-4 mb-4 rounded-lg">
                                <p><strong>Propuesta:</strong> ${proposal.propuesta}</p>
                                <p><strong>Estado:</strong> ${proposal.estado}</p>
                            </div>
                        `;
                    }
                });
                this.proposalsList.innerHTML = proposalsHTML || '<p>No has enviado ninguna propuesta aún.</p>';
            } else {
                this.proposalsList.innerHTML = '<p>No hay propuestas disponibles.</p>';
            }
        }).catch((error) => {
            console.error("Error al cargar las propuestas:", error);
        });
    }
};

// Inicializar la funcionalidad del perfil
if (document.getElementById('userLoginForm')) {
    profileFunctionality.init();
}

// Funcionalidad para visualizacion.html
const codeForm = document.getElementById('codeForm');
const generateCodeBtn = document.getElementById('generateCode');
const codeSection = document.getElementById('codeSection');
const noDataSection = document.getElementById('noDataSection');
const resultsSection = document.getElementById('resultsSection');
const votingInfo = document.getElementById('votingInfo');
const resultsChart = document.getElementById('resultsChart');
const votingStatus = document.getElementById('votingStatus');
const generatedCodeSection = document.getElementById('generatedCodeSection');
const generatedCodeSpan = document.getElementById('generatedCode');
const copyCodeBtn = document.getElementById('copyCode');

let chart = null;

if (codeForm) {
    codeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const accessCode = document.getElementById('accessCode').value;
        verifyAndShowResults(accessCode);
    });
}

if (generateCodeBtn) {
    generateCodeBtn.addEventListener('click', generateAccessCode);
}

if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', copyGeneratedCode);
}

function generateAccessCode() {
    const votingRef = ref(db, 'votacion/dequetrata');
    get(votingRef).then((snapshot) => {
        if (snapshot.exists()) {
            const votingData = snapshot.val();
            if (votingData.titulo === 'No hay datos') {
                alert('No hay votación activa en este momento.');
                return;
            }
            if (votingData.generacion) {
                alert('Lo siento, tu código ya ha sido generado.');
            } else {
                const newCode = Math.random().toString(36).substr(2, 8).toUpperCase();
                update(votingRef, {
                    codigo: newCode,
                    generacion: true
                }).then(() => {
                    generatedCodeSpan.textContent = newCode;
                    generatedCodeSection.classList.remove('hidden');
                });
            }
        }
    }).catch((error) => {
        console.error("Error al generar el código:", error);
    });
}

function copyGeneratedCode() {
    const codeText = generatedCodeSpan.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        alert('Código copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el código: ', err);
    });
}

function verifyAndShowResults(code) {
    const votingRef = ref(db, 'votacion/dequetrata');
    get(votingRef).then((snapshot) => {
        if (snapshot.exists()) {
            const votingData = snapshot.val();
            if (votingData.titulo === 'No hay datos') {
                showNoDataSection();
            } else if (votingData.codigo === code && !votingData.codigousado) {
                // Marcar la votación como finalizada
                const updates = {
                    codigousado: true,
                    votacionFinalizada: true
                };
                update(ref(db, 'votacion/dequetrata'), updates).then(() => {
                    codeSection.classList.add('hidden');
                    loadVotingResults();
                }).catch((error) => {
                    console.error("Error al finalizar la votación:", error);
                });
            } else if (votingData.codigousado) {
                alert('Este código ya ha sido utilizado. La votación ha finalizado.');
                showCodeUsedSection(); // Nueva función para mostrar un mensaje cuando el código ya fue usado
            } else {
                alert('Código incorrecto.');
            }
        } else {
            showNoDataSection();
        }
    }).catch((error) => {
        console.error("Error al verificar el código:", error);
    });
}

// Nueva función para mostrar un mensaje cuando el código ya fue usado
function showCodeUsedSection() {
    codeSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    noDataSection.classList.remove('hidden');
    noDataSection.innerHTML = `
        <div class="p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Acceso no disponible</h2>
            <p class="text-gray-600">Este código ya ha sido utilizado y la votación ha finalizado. Los resultados ya no están disponibles para visualización.</p>
        </div>
    `;
}



function showNoDataSection() {
    codeSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    noDataSection.classList.remove('hidden');
}

function loadVotingResults() {
    const votingRef = ref(db, 'votacion');
    get(votingRef).then((snapshot) => {
        if (snapshot.exists()) {
            const votingData = snapshot.val();
            const dequetrata = votingData.dequetrata;
            
            votingInfo.innerHTML = `
                <h3 class="text-2xl font-semibold mb-2">${dequetrata.titulo}</h3>
                <p class="text-gray-600">${dequetrata.subtitulo}</p>
            `;

            const votes = {
                'Sí': votingData.si || 0,
                'No': votingData.no || 0,
                'Abstención': votingData.abstencion || 0
            };

            createChart(votes);
            determineVotingStatus(votes);
            resultsSection.classList.remove('hidden');
        }
    }).catch((error) => {
        console.error("Error al cargar los resultados:", error);
    });
}

function createChart(votes) {
    if (chart) {
        chart.destroy();
    }

    const ctx = resultsChart.getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(votes),
            datasets: [{
                data: Object.values(votes),
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Resultados de la Votación'
                }
            }
        }
    });
}

function determineVotingStatus(votes) {
    const total = votes['Sí'] + votes['No'] + votes['Abstención'];
    let status = '';

    if (total === 0) {
        status = 'No se han registrado votos aún.';
    } else if (votes['Sí'] > votes['No']) {
        status = 'La propuesta ha sido APROBADA.';
    } else if (votes['No'] > votes['Sí']) {
        status = 'La propuesta ha sido RECHAZADA.';
    } else if (votes['Sí'] === votes['No']) {
        status = 'La votación ha resultado en un EMPATE.';
    } else if (votes['Abstención'] === total) {
        status = 'Todos los votos han sido ABSTENCIONES.';
    }

    votingStatus.textContent = status;
}
