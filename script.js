// Variable State Utama
let students = [];
let isEditMode = false;
let alertTimeout = null;

// Mengambil Elemen DOM
const studentForm = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const studentNameInput = document.getElementById("studentName");
const studentScoreInput = document.getElementById("studentScore");
const btnSubmit = document.getElementById("btnSubmit");
const btnCancel = document.getElementById("btnCancel");
const formTitle = document.getElementById("formTitle");
const studentList = document.getElementById("studentList");
const totalStudentsEl = document.getElementById("totalStudents");
const averageScoreEl = document.getElementById("averageScore");
const alertMessage = document.getElementById("alertMessage");
const searchInput = document.getElementById("searchInput");

// Event Listener saat Halaman Selesai Dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadStudentsFromStorage();
    renderStudents();

    studentForm.addEventListener("submit", handleFormSubmit);
    btnCancel.addEventListener("click", resetForm);
    searchInput.addEventListener("input", () => renderStudents());
});

// 1. Mengambil Data dari LocalStorage
function loadStudentsFromStorage() {
    const storedData = localStorage.getItem("students");
    if (storedData) {
        students = JSON.parse(storedData);
    } else {
        students = [];
    }
}

// 2. Menyimpan Data ke LocalStorage
function saveStudentsToStorage() {
    localStorage.setItem("students", JSON.stringify(students));
}

// 3. Render UI Daftar Siswa & Statistik
function renderStudents() {
    const keyword = searchInput.value.toLowerCase().trim();
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(keyword)
    );

    studentList.innerHTML = "";

    if (filteredStudents.length === 0) {
        studentList.innerHTML = `<div class="empty-state">Belum ada data siswa.</div>`;
    } else {
        filteredStudents.forEach((student, index) => {
            const item = document.createElement("div");
            item.className = "student-item";
            item.innerHTML = `
                <div class="student-info">
                    <span class="student-name">${index + 1}. ${escapeHtml(student.name)}</span>
                    <span class="student-score">Nilai: ${student.score}</span>
                </div>
                <div class="student-actions">
                    <button class="btn-sm btn-edit" onclick="editStudent(${student.id})">✏️ Ubah</button>
                    <button class="btn-sm btn-delete" onclick="deleteStudent(${student.id})">🗑️ Hapus</button>
                </div>
            `;
            studentList.appendChild(item);
        });
    }

    updateStats();
}

// 4. Form Handler (Tambah / Update Siswa)
function handleFormSubmit(e) {
    e.preventDefault();

    const name = studentNameInput.value.trim();
    const score = parseFloat(studentScoreInput.value);

    if (!name || isNaN(score)) return;

    if (isEditMode) {
        updateStudent(parseInt(studentIdInput.value), name, score);
    } else {
        addStudent(name, score);
    }
}

// 5. Fitur Tambah Siswa (Create)
function addStudent(name, score) {
    const newStudent = {
        id: Date.now(),
        name: name,
        score: score
    };

    students.push(newStudent);
    saveStudentsToStorage();
    renderStudents();
    resetForm();
    showAlert(`✅ Data siswa ${name} berhasil ditambahkan.`);
}

// 6. Masuk ke Mode Edit (Update Prep)
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    isEditMode = true;
    studentIdInput.value = student.id;
    studentNameInput.value = student.name;
    studentScoreInput.value = student.score;

    formTitle.textContent = "✏️ Edit Siswa";
    btnSubmit.textContent = "💾 Update Siswa";
    btnCancel.classList.remove("hidden");

    studentNameInput.focus();
}

// 7. Simpan Perubahan Edit (Update Action)
function updateStudent(id, name, score) {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
        students[index].name = name;
        students[index].score = score;

        saveStudentsToStorage();
        renderStudents();
        resetForm();
        showAlert(`🔄 Data siswa ${name} berhasil diperbarui.`);
    }
}

// 8. Fitur Hapus Siswa (Delete dengan Confirm)
function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    const isConfirmed = confirm(`Apakah kamu yakin ingin menghapus siswa ${student.name}?`);

    if (isConfirmed) {
        students = students.filter(s => s.id !== id);
        saveStudentsToStorage();
        renderStudents();

        if (isEditMode && parseInt(studentIdInput.value) === id) {
            resetForm();
        }

        showAlert(`🗑️ Data siswa ${student.name} berhasil dihapus.`);
    }
}

// 9. Reset Form ke Mode Default (Tambah Siswa)
function resetForm() {
    isEditMode = false;
    studentIdInput.value = "";
    studentForm.reset();
    formTitle.textContent = "➕ Tambah Siswa";
    btnSubmit.textContent = "➕ Tambah Siswa";
    btnCancel.classList.add("hidden");
}

// 10. Update Statistik (Total & Rata-rata)
function updateStats() {
    const total = students.length;
    totalStudentsEl.textContent = total;

    if (total === 0) {
        averageScoreEl.textContent = "0";
    } else {
        const sum = students.reduce((acc, student) => acc + student.score, 0);
        const avg = sum / total;
        averageScoreEl.textContent = Number.isInteger(avg) ? avg : avg.toFixed(1);
    }
}

// 11. Menampilkan Alert Notifikasi Otomatis
function showAlert(message) {
    if (alertTimeout) clearTimeout(alertTimeout);

    alertMessage.textContent = message;
    alertMessage.classList.remove("hidden");

    alertTimeout = setTimeout(() => {
        alertMessage.classList.add("hidden");
    }, 3000);
}

// Helper Sanitasi HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}