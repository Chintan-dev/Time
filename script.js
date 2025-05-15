// Import Firebase modules and config
import { 
    auth, 
    db, 
    provider, 
    serverTimestamp,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    deleteDoc
} from './firebase-config.js';

console.log("🚀 Starting Time Tracker App...");

// Global variables
let currentUser = null;
let currentDate = moment().format('YYYY-MM-DD');
let rowCount = 1;
let autoUpdateInterval;

// Check for redirect result first
getRedirectResult(auth).then((result) => {
    if (result && result.user) {
        console.log('✅ User signed in via redirect:', result.user.displayName);
    }
}).catch((error) => {
    console.error('❌ Redirect error:', error);
    if (error.code !== 'auth/operation-not-allowed') {
        console.error('Authentication error:', error.message);
    }
});

// Authentication state observer
onAuthStateChanged(auth, (user) => {
    console.log("🔄 Auth state changed:", user ? user.email : "No user");
    
    // Hide loading page
    document.getElementById('loadingPage').classList.add('hidden');
    
    if (user) {
        currentUser = user;
        showDashboard();
    } else {
        showLoginPage();
        currentUser = null;
    }
});

function showDashboard() {
    console.log("📱 Showing dashboard for:", currentUser.displayName || currentUser.email);
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Welcome, ${currentUser.displayName || currentUser.email}`;
    document.getElementById('dateSelector').value = currentDate;
    document.getElementById('currentdate').textContent = currentDate;
    loadDateData(currentDate);
    loadHistory();
    startAutoUpdate();
}

function showLoginPage() {
    console.log("🔐 Showing login page");
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

// Login function using redirect with error handling
document.getElementById('loginBtn').addEventListener('click', async () => {
    console.log("🔑 Attempting login...");
    try {
        await signInWithRedirect(auth, provider);
    } catch (error) {
        console.error('❌ Login error:', error);
        let errorMessage = 'Login failed. ';
        
        switch (error.code) {
            case 'auth/operation-not-allowed':
                errorMessage += 'Google sign-in is not enabled. Please check Firebase Console.';
                break;
            case 'auth/configuration-not-found':
                errorMessage += 'Firebase configuration error. Please check your project settings.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage += 'This domain is not authorized. Add it to Firebase Console.';
                break;
            default:
                errorMessage += error.message;
        }
        alert(errorMessage);
    }
});

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    console.log("🚪 Logging out...");
    signOut(auth);
});

// Date selector handlers
document.getElementById('loadDateBtn').addEventListener('click', () => {
    const selectedDate = document.getElementById('dateSelector').value;
    if (selectedDate) {
        loadDateData(selectedDate);
    }
});

document.getElementById('todayBtn').addEventListener('click', () => {
    const today = moment().format('YYYY-MM-DD');
    document.getElementById('dateSelector').value = today;
    loadDateData(today);
});

function startAutoUpdate() {
    if (autoUpdateInterval) clearInterval(autoUpdateInterval);
    autoUpdateInterval = setInterval(updateLastEndTime, 1000);
}

function updateLastEndTime() {
    const selectedDate = document.getElementById('dateSelector').value;
    if (selectedDate !== moment().format('YYYY-MM-DD')) return;

    const lastRow = $("#timeEntries tr").last();
    if (lastRow.length) {
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        lastRow.find("input[type='time']").last().val(timeString);
        calculateTotal();
    }
}

function addNewRow() {
    rowCount++;
    const currentDateLabel = document.getElementById('currentdate').textContent;
    const newRow = `
        <tr class="new-row">
            <td align="center"><label>${currentDateLabel}</label></td>
            <td align="center">
                <div class="time-input-container">
                    <input type="time" id="starttime${rowCount}">
                </div>
            </td>
            <td align="center">
                <div class="time-input-container">
                    <input type="time" id="endtime${rowCount}">
                </div>
            </td>
            <td align="center"><label id="duration${rowCount}"></label></td>
            <td align="center">
                <button type="button" class="delete-btn tooltip" onclick="deleteRow(this)">
                    Delete
                    <span class="tooltiptext">Remove this time entry</span>
                </button>
            </td>
        </tr>
    `;
    $("#timeEntries").append(newRow);
    $(".new-row").hide().fadeIn(500);
    $(".new-row").removeClass('new-row');
    saveToLocalStorage();
    saveToFirebase();
}

function deleteRow(button) {
    if ($("#timeEntries tr").length > 1) {
        $(button).closest('tr').fadeOut(300, function() {
            $(this).remove();
            saveToLocalStorage();
            saveToFirebase();
            calculateTotal();
        });
    }
}

function getHourDifference(startDate, endDate) {
    const date_future = new Date(endDate);
    const date_now = new Date(startDate);

    let seconds = Math.floor((date_future - (date_now))/1000);
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    const days = Math.floor(hours/24);
    
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

    const hours1 = (hours < 10) ? "0"+hours : hours; 
    const minutes1 = (minutes < 10) ? "0"+minutes : minutes;
    const seconds1 = (seconds < 10) ? "0"+seconds : seconds; 
    
    return hours1+":"+minutes1+":"+seconds1;
}

function calculateTotal() {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalSeconds = 0;

    $("#timeEntries tr").each(function() {
        const duration = $(this).find("td:eq(3) label").text();
        if (duration) {
            const [hours, minutes, seconds] = duration.split(':').map(Number);
            totalHours += hours || 0;
            totalMinutes += minutes || 0;
            totalSeconds += seconds || 0;
        }
    });

    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    const formattedTotal = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    $("#timeduration").text(formattedTotal);

    if (totalHours >= 8 && totalMinutes >= 30) {
        $("#totalTr").addClass('over-limit');
    } else {
        $("#totalTr").removeClass('over-limit');
    }

    saveToFirebase();
}

function saveToLocalStorage() {
    const entries = [];
    $("#timeEntries tr").each(function() {
        const startTime = $(this).find("input[type='time']").first().val();
        const endTime = $(this).find("input[type='time']").last().val();
        if (startTime && endTime) {
            entries.push({startTime, endTime});
        }
    });
    const selectedDate = document.getElementById('dateSelector').value;
    localStorage.setItem(`timeEntries_${selectedDate}`, JSON.stringify(entries));
}

function loadFromLocalStorage() {
    const selectedDate = document.getElementById('dateSelector').value;
    const entries = JSON.parse(localStorage.getItem(`timeEntries_${selectedDate}`) || '[]');
    
    // Clear existing rows first
    $("#timeEntries").empty();
    
    if (entries.length === 0) {
        addDefaultRow();
    } else {
        entries.forEach((entry, index) => {
            if (index === 0) {
                addDefaultRow();
            } else {
                addNewRow();
            }
            $(`#starttime${index + 1}`).val(entry.startTime);
            $(`#endtime${index + 1}`).val(entry.endTime);
        });
    }
}

function addDefaultRow() {
    const selectedDate = document.getElementById('dateSelector').value;
    const defaultRow = `
        <tr>
            <td align="center"><label>${selectedDate}</label></td>
            <td align="center">
                <div class="time-input-container">
                    <input type="time" id="starttime1">
                </div>
            </td>
            <td align="center">
                <div class="time-input-container">
                    <input type="time" id="endtime1">
                </div>
            </td>
            <td align="center"><label id="duration1"></label></td>
            <td align="center">
                <button type="button" class="delete-btn tooltip" onclick="deleteRow(this)">
                    Delete
                    <span class="tooltiptext">Remove this time entry</span>
                </button>
            </td>
        </tr>
    `;
    $("#timeEntries").append(defaultRow);
    rowCount = 1;
}

async function saveToFirebase() {
    if (!currentUser) return;

    console.log("💾 Saving to Firebase...");
    const selectedDate = document.getElementById('dateSelector').value;
    const totalTime = $("#timeduration").text();
    const entries = [];
    
    $("#timeEntries tr").each(function() {
        const startTime = $(this).find("input[type='time']").first().val();
        const endTime = $(this).find("input[type='time']").last().val();
        if (startTime && endTime) {
            entries.push({startTime, endTime});
        }
    });

    const data = {
        userId: currentUser.uid,
        date: selectedDate,
        entries: entries,
        totalTime: totalTime,
        timestamp: serverTimestamp()
    };

    try {
        await setDoc(doc(db, 'timeEntries', `${currentUser.uid}_${selectedDate}`), data);
        console.log("✅ Saved to Firebase successfully");
    } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
    }
}

async function loadFromFirebase(date) {
    if (!currentUser) return Promise.resolve();

    console.log("📥 Loading from Firebase for date:", date);
    try {
        const docRef = doc(db, 'timeEntries', `${currentUser.uid}_${date}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("✅ Data loaded from Firebase");
            
            // Clear existing rows
            $("#timeEntries").empty();
            
            if (data.entries && data.entries.length > 0) {
                data.entries.forEach((entry, index) => {
                    if (index === 0) {
                        addDefaultRow();
                    } else {
                        addNewRow();
                    }
                    $(`#starttime${index + 1}`).val(entry.startTime);
                    $(`#endtime${index + 1}`).val(entry.endTime);
                });
            } else {
                addDefaultRow();
            }
            
            document.getElementById('currentdate').textContent = date;
            setTimeout(calculateTotal, 100);
        } else {
            console.log("📄 No data found in Firebase, using default");
            addDefaultRow();
            document.getElementById('currentdate').textContent = date;
        }
    } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        loadFromLocalStorage();
    }
}

function loadDateData(date) {
    console.log("📅 Loading data for date:", date);
    document.getElementById('currentdate').textContent = date;
    rowCount = 1;
    
    if (date === moment().format('YYYY-MM-DD')) {
        startAutoUpdate();
    } else {
        if (autoUpdateInterval) clearInterval(autoUpdateInterval);
    }
    
    loadFromFirebase(date).then(() => {
        loadFromLocalStorage();
    });
}

async function loadHistory() {
    if (!currentUser) return;

    console.log("📚 Loading history...");
    try {
        const q = query(
            collection(db, 'timeEntries'),
            where('userId', '==', currentUser.uid),
            orderBy('date', 'desc'),
            limit(30)
        );
        
        const querySnapshot = await getDocs(q);
        let historyHtml = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isToday = data.date === moment().format('YYYY-MM-DD');
            const dayOfWeek = moment(data.date).format('dddd');
            
            historyHtml += `
                <div class="history-entry" onclick="loadHistoryDate('${data.date}')">
                    <span>
                        ${data.date} (${dayOfWeek})${isToday ? ' - Today' : ''}: ${data.totalTime || '00:00:00'}
                    </span>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteHistoryEntry('${data.date}')">Delete</button>
                </div>
            `;
        });
        
        if (historyHtml === '') {
            historyHtml = '<div class="history-entry">No history found</div>';
        }
        
        $("#historyList").html(historyHtml);
        console.log("✅ History loaded successfully");
    } catch (error) {
        console.error('❌ Error loading history:', error);
    }
}

function loadHistoryDate(date) {
    document.getElementById('dateSelector').value = date;
    loadDateData(date);
}

async function deleteHistoryEntry(date) {
    if (!currentUser) return;
    
    if (confirm(`Are you sure you want to delete the entry for ${date}?`)) {
        console.log("🗑️ Deleting entry for date:", date);
        try {
            await deleteDoc(doc(db, 'timeEntries', `${currentUser.uid}_${date}`));
            localStorage.removeItem(`timeEntries_${date}`);
            loadHistory();
            
            if (document.getElementById('dateSelector').value === date) {
                loadDateData(date);
            }
            console.log("✅ Entry deleted successfully");
        } catch (error) {
            console.error('❌ Error deleting entry:', error);
            alert('Error deleting entry. Please try again.');
        }
    }
}

// Make functions globally available for onclick handlers
window.addNewRow = addNewRow;
window.deleteRow = deleteRow;
window.loadHistoryDate = loadHistoryDate;
window.deleteHistoryEntry = deleteHistoryEntry;

// Update duration calculation interval
setInterval(function(){
    const selectedDate = document.getElementById('dateSelector').value;
    const tdate = moment(selectedDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    
    $("#timeEntries tr").each(function(index) {
        const rowNum = index + 1;
        const stime = $(`#starttime${rowNum}`).val();
        const etime = $(`#endtime${rowNum}`).val();
        
        if (stime && etime) {
            const startDate = tdate + " " + stime + ":00";
            const endDate = tdate + " " + etime + ":00";
            const difference = getHourDifference(startDate, endDate);
            $(`#duration${rowNum}`).text(difference);
        }
    });

    calculateTotal();
}, 1000);

// Save when inputs change
$(document).on('change', "input[type='time']", function() {
    saveToLocalStorage();
    saveToFirebase();
});

console.log("✅ Time Tracker App loaded successfully!");