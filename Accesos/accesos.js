import { supabase } from '../scripts/supabase.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Cliente secundario para registrar sin perder la sesión de admin
const supabaseUrl = 'https://twneirdsvyxsdsneidhi.supabase.co';
const supabaseKey = 'sb_publishable_A0yo_kDAGY3OamrUOOL9Bw_ShVWdBMF';
const supabaseAdminCreation = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const modal = document.getElementById('creationModal');
const form = document.getElementById('createUserForm');
const btnCreate = document.getElementById('btnCreateUser');
const tableBody = document.getElementById('usersTableBody');

window.toggleModal = (show) => {
  if (show) modal.classList.add('active');
  else modal.classList.remove('active');
};

// Almacenamiento simulado en Frontend para la visualización de tabla
// En la vida real, Supabase requiere el Service-Role-Key para hacer un SELECT de todos los auth.users
function getMockData() {
  const data = localStorage.getItem('mock_supabase_users');
  return data ? JSON.parse(data) : [];
}
function saveMockData(user) {
  const data = getMockData();
  data.push(user);
  localStorage.setItem('mock_supabase_users', JSON.stringify(data));
}
function deleteMockData(email) {
  const data = getMockData().filter(u => u.email !== email);
  localStorage.setItem('mock_supabase_users', JSON.stringify(data));
  renderTable();
}

window.deleteUser = (email) => {
  if(confirm(`¿Estás seguro de eliminar (virtual) a ${email}?`)) {
    deleteMockData(email);
  }
};

function renderTable() {
  const users = getMockData();
  if(users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay usuarios registrados por ti aún.</td></tr>`;
    return;
  }
  
  tableBody.innerHTML = users.map(user => `
    <tr>
      <td><strong>${user.email}</strong></td>
      <td><span class="chip chip--accent">${user.role}</span></td>
      <td><span style="color:var(--color-success)">Activo</span></td>
      <td>
        <button class="btn btn--secondary" onclick="window.deleteUser('${user.email}')" style="padding: 4px 12px; font-size: 13px;">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('new_email').value;
  const password = document.getElementById('new_password').value;
  const role = document.getElementById('new_role').value;

  btnCreate.disabled = true;
  btnCreate.textContent = "Creando y Registrando...";

  // Intentamos registrar en la Base de Datos Real de Supabase
  const { data, error } = await supabaseAdminCreation.auth.signUp({
    email,
    password,
    options: {
      data: { role: role } // Metadata del usuario
    }
  });

  if (error) {
    alert("Error de Supabase: " + error.message);
  } else {
    alert(`¡Usuario ${email} registrado con éxito en Supabase y correo simulado enviado!`);
    saveMockData({ email, role });
    renderTable();
    window.toggleModal(false);
    form.reset();
  }

  btnCreate.disabled = false;
  btnCreate.textContent = "Crear y Enviar Acceso";
});
