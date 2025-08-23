// Firebase config
const firebaseConfig = {
	apiKey: "AIzaSyAcPhlsGZepoakFV6mEH4xEZ0iWqZfxiCw",
	authDomain: "prakash-f9bf4.firebaseapp.com",
	databaseURL:
		"https://prakash-f9bf4-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "prakash-f9bf4",
	storageBucket: "prakash-f9bf4.appspot.com",
	messagingSenderId: "3154372934",
	appId: "1:3154372934:web:8e26c0166595e49c619d47",
	measurementId: "G-WS3CMWSQDH",
};


// This is a comment
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

const appDiv = document.getElementById("app");

function homeScreen() {
	appDiv.innerHTML = `
		<div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(120deg,#e3f0ff 0%,#cce0ff 100%);padding:0;">
			<div style="background:#fff;box-shadow:0 4px 24px rgba(49,130,206,0.08);border-radius:18px;padding:40px 32px;max-width:350px;width:90vw;display:flex;flex-direction:column;align-items:center;">
				<h1 style="text-align:center;font-size:2.2rem;font-weight:700;color:#2a4365;margin-bottom:32px;letter-spacing:1px;">Game Data Manager</h1>
				<div style="display:flex;flex-direction:column;gap:18px;width:100%;align-items:center;">
					<button id="createUserBtn" style="padding:14px 0;font-size:1.08rem;background:#3182ce;color:#fff;border:none;border-radius:8px;box-shadow:0 2px 8px rgba(49,130,206,0.08);font-weight:600;cursor:pointer;transition:background 0.2s;width:100%;">Create User</button>
					<button id="listUsersBtn" style="padding:14px 0;font-size:1.08rem;background:#38b2ac;color:#fff;border:none;border-radius:8px;box-shadow:0 2px 8px rgba(56,178,172,0.08);font-weight:600;cursor:pointer;transition:background 0.2s;width:100%;">List of Users</button>
				</div>
			</div>
		</div>
	`;
	document.getElementById("createUserBtn").onclick = createUserScreen;
	document.getElementById("listUsersBtn").onclick = listUsersScreen;
}

function createUserScreen() {
	appDiv.innerHTML = `
	<h2>Create User</h2>
	<label>Username: <input type="text" id="usernameInput" maxlength="32" style="margin-bottom:12px;"></label><br>
	<button id="eLevelBtn">E Level</button>
	<button id="colorLevelBtn">Color Level</button>
	<button id="faceLevelBtn">Face Level</button>
	<button id="backBtn">Back</button>
	<div id="levelForm"></div>
  `;
	document.getElementById("eLevelBtn").onclick = () => eLevelForm();
	document.getElementById("colorLevelBtn").onclick = () => colorLevelForm();
	document.getElementById("faceLevelBtn").onclick = () => faceLevelForm();
	document.getElementById("backBtn").onclick = homeScreen;
}

function eLevelForm(userId = null, existingData = null) {
	const levelForm = document.getElementById("levelForm");
	let countValue = existingData ? existingData.length : 0;
	levelForm.innerHTML = `
	<div class="level-section">
	  <h3>E Level</h3>
	  <label>Number of Items: <input type="number" id="eLevelCount" min="0" max="100" value="${countValue}"></label>
	  <form id="eLevelItems"></form>
	  <button id="saveELevelBtn" style="display:none;">Save</button>
	</div>
  `;
	function generateItems() {
		const count = parseInt(document.getElementById("eLevelCount").value);
		const itemsForm = document.getElementById("eLevelItems");
		itemsForm.innerHTML = "";
		// Try to get gameData from userData if available
		let gameData = null;
		if (
			userId &&
			window.currentUserData &&
			window.currentUserData.gameData &&
			window.currentUserData.gameData.e
		) {
			gameData = window.currentUserData.gameData.e;
		}
		for (let i = 0; i < count; i++) {
			const val =
				existingData && existingData[i] !== undefined
					? existingData[i]
					: "";
			let gameDataHtml = "";
			if (gameData && gameData[i]) {
				const gd = gameData[i];
				gameDataHtml = `<div class='gamedata-box' style='margin-top:6px;padding:6px;background:#f6f6f6;border-radius:6px;'>
					<strong>Game Data:</strong><br>
					Score Change: ${
						gd.scoreChange !== undefined
							? gd.scoreChange
							: gd.ScoreChange !== undefined
							? gd.ScoreChange
							: "-"
					}<br>
					Attempts: ${gd.attempts !== undefined ? gd.attempts : "-"}<br>
					Distance: ${gd.distance !== undefined ? gd.distance : "-"}
				</div>`;
			}
			itemsForm.innerHTML += `
				<div style="background: linear-gradient(90deg, #e3f0ff 0%, #f9f9f9 100%); border: 1px solid #b3c6e0; border-radius: 10px; margin-bottom: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(180,200,230,0.08);">
					<label style="font-weight:600;">Item ${
						i + 1
					}: <input type="number" name="item${i}" value="${val}" required style="margin-left:8px;"> <span>cm</span></label>
					${gameDataHtml}
				</div>
			`;
		}
		document.getElementById("saveELevelBtn").style.display =
			count > 0 ? "inline" : "none";
	}
	document
		.getElementById("eLevelCount")
		.addEventListener("input", generateItems);
	generateItems();
	document.getElementById("saveELevelBtn").onclick = async (e) => {
		e.preventDefault();
		const count = parseInt(document.getElementById("eLevelCount").value);
		const items = [];
		for (let i = 0; i < count; i++) {
			items.push(
				Number(document.querySelector(`[name="item${i}"]`).value)
			);
		}
		if (userId) {
			await db.ref(`users/${userId}/eLevel`).set(items);
			await db
				.ref(`users/${userId}/updatedAt`)
				.set(new Date().toISOString());
			alert("E Level data updated!");
			editUserScreen(userId, {
				...(await db.ref(`users/${userId}`).get()).val(),
			});
		} else {
			const username = document
				.getElementById("usernameInput")
				.value.trim();
			if (!username) {
				alert("Please enter a username.");
				return;
			}
			const now = new Date().toISOString();
			const userRef = db.ref("users").push();
			await userRef.set({
				username,
				createdAt: now,
				updatedAt: now,
				eLevel: items,
			});
			alert("E Level data saved!");
			homeScreen();
		}
	};
}

function colorLevelForm(userId = null, existingData = null) {
	const levelForm = document.getElementById("levelForm");
	let countValue = existingData ? existingData.length : 0;
	levelForm.innerHTML = `
	<div class="level-section">
	  <h3>Color Level</h3>
	  <label>Number of Items: <input type="number" id="colorLevelCount" min="0" max="100" value="${countValue}"></label>
	  <form id="colorLevelItems"></form>
	  <button id="saveColorLevelBtn" style="display:none;">Save</button>
	</div>
  `;
	function generateItems() {
		const count = parseInt(
			document.getElementById("colorLevelCount").value
		);
		const itemsForm = document.getElementById("colorLevelItems");
		itemsForm.innerHTML = "";
		// Try to get gameData from userData if available
		let gameData = null;
		if (
			userId &&
			window.currentUserData &&
			window.currentUserData.gameData &&
			window.currentUserData.gameData.color
		) {
			gameData = window.currentUserData.gameData.color;
		}
		for (let i = 0; i < count; i++) {
			let gameDataHtml = "";
			if (gameData && gameData[i]) {
				const gd = gameData[i];
				gameDataHtml = `<div class='gamedata-box' style='margin-top:6px;padding:6px;background:#f6f6f6;border-radius:6px;'>
					<strong>Game Data:</strong><br>
					Score Change: ${gd.scoreChange ?? "-"}<br>
					Attempts: ${gd.attempts ?? "-"}<br>
					Distance: ${gd.distance ?? "-"}
				</div>`;
			}
			itemsForm.innerHTML += `
				<div style="background: linear-gradient(90deg, #fffbe3 0%, #f9f9f9 100%); border: 1px solid #e0d6b3; border-radius: 10px; margin-bottom: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(230,220,180,0.08);">
					<label style="font-weight:600;">Item ${i + 1}:</label>
					<div style="display:flex;gap:10px;">
						${[0, 1, 2]
							.map((j) => {
								const val =
									existingData &&
									existingData[i] &&
									existingData[i][j]
										? existingData[i][j]
										: "";
								return `
							<div style="display:flex;flex-direction:column;align-items:center;">
								<div class="color-square" id="colorPreview${i}_${j}" style="background:${val}"></div>
								<input type="text" name="color${i}_${j}" value="${val}" placeholder="#RRGGBB" maxlength="7" autocomplete="off">
							</div>
						`;
							})
							.join("")}
					</div>
					${gameDataHtml}
				</div>
			`;
		}
		// Add color preview listeners
		for (let i = 0; i < count; i++) {
			for (let j = 0; j < 3; j++) {
				const input = document.querySelector(`[name="color${i}_${j}"]`);
				input.addEventListener("input", () => {
					document.getElementById(
						`colorPreview${i}_${j}`
					).style.background = input.value;
				});
			}
		}
		document.getElementById("saveColorLevelBtn").style.display =
			count > 0 ? "inline" : "none";
	}
	document
		.getElementById("colorLevelCount")
		.addEventListener("input", generateItems);
	generateItems();
	document.getElementById("saveColorLevelBtn").onclick = async (e) => {
		e.preventDefault();
		const count = parseInt(
			document.getElementById("colorLevelCount").value
		);
		const items = [];
		for (let i = 0; i < count; i++) {
			const colors = [];
			for (let j = 0; j < 3; j++) {
				colors.push(
					document.querySelector(`[name="color${i}_${j}"]`).value
				);
			}
			items.push(colors);
		}
		if (userId) {
			await db.ref(`users/${userId}/colorLevel`).set(items);
			await db
				.ref(`users/${userId}/updatedAt`)
				.set(new Date().toISOString());
			alert("Color Level data updated!");
			editUserScreen(userId, {
				...(await db.ref(`users/${userId}`).get()).val(),
			});
		} else {
			const username = document
				.getElementById("usernameInput")
				.value.trim();
			if (!username) {
				alert("Please enter a username.");
				return;
			}
			const now = new Date().toISOString();
			const userRef = db.ref("users").push();
			await userRef.set({
				username,
				createdAt: now,
				updatedAt: now,
				colorLevel: items,
			});
			alert("Color Level data saved!");
			homeScreen();
		}
	};
}

function faceLevelForm(userId = null, existingData = null) {
	const levelForm = document.getElementById("levelForm");
	let countValue = existingData ? existingData.length : 0;
	levelForm.innerHTML = `
	<div class="level-section">
	  <h3>Face Level</h3>
	  <label>Number of Items: <input type="number" id="faceLevelCount" min="0" max="20" value="${countValue}"></label>
	  <form id="faceLevelItems"></form>
	  <button id="saveFaceLevelBtn" style="display:none;">Save</button>
	</div>
  `;
	function generateItems() {
		const count = parseInt(document.getElementById("faceLevelCount").value);
		const itemsForm = document.getElementById("faceLevelItems");
		itemsForm.innerHTML = "";
		// Try to get gameData from userData if available
		let gameData = null;
		if (
			userId &&
			window.currentUserData &&
			window.currentUserData.gameData &&
			window.currentUserData.gameData.face
		) {
			gameData = window.currentUserData.gameData.face;
		}
		for (let i = 0; i < count; i++) {
			let gameDataHtml = "";
			if (gameData && gameData[i]) {
				const gd = gameData[i];
				gameDataHtml = `<div class='gamedata-box' style='margin-top:6px;padding:6px;background:#f6f6f6;border-radius:6px;'>
					<strong>Game Data:</strong><br>
					Score Change: ${gd.scoreChange ?? "-"}<br>
					Attempts: ${gd.attempts ?? "-"}<br>
					Distance: ${gd.distance ?? "-"}
				</div>`;
			}
			itemsForm.innerHTML += `
				<div style="background: linear-gradient(90deg, #fbe3ff 0%, #f9f9f9 100%); border: 1px solid #e0b3d6; border-radius: 10px; margin-bottom: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(230,180,220,0.08);">
					<label style="font-weight:600;">Item ${i + 1}:</label>
					<div style="display:flex;gap:10px;flex-wrap:wrap;padding:8px 0;">
						${[0, 1, 2]
							.map((j) => {
								let imgUrl =
									existingData &&
									existingData[i] &&
									existingData[i][j]
										? existingData[i][j]
										: "";
								return `
							<div style="display:flex;flex-direction:column;align-items:center;min-width:120px;max-width:150px;">
								<div class="img-square" id="imgPreview${i}_${j}" style="background-image:${
									imgUrl ? `url('${imgUrl}')` : "none"
								};width:80px;height:80px;border-radius:8px;border:1px solid #ccc;background-size:cover;background-position:center;margin-bottom:8px;"></div>
								<input type="file" accept="image/*" name="face${i}_${j}" style="width:100%;">
							</div>
						`;
							})
							.join("")}
					</div>
					${gameDataHtml}
				</div>
			`;
		}
		// Add image preview listeners
		for (let i = 0; i < count; i++) {
			for (let j = 0; j < 3; j++) {
				const input = document.querySelector(`[name="face${i}_${j}"]`);
				input.addEventListener("change", (e) => {
					const file = e.target.files[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = (ev) => {
							document.getElementById(
								`imgPreview${i}_${j}`
							).style.backgroundImage = `url('${ev.target.result}')`;
						};
						reader.readAsDataURL(file);
					}
				});
			}
		}
		document.getElementById("saveFaceLevelBtn").style.display =
			count > 0 ? "inline" : "none";
	}
	document
		.getElementById("faceLevelCount")
		.addEventListener("input", generateItems);
	generateItems();
	document.getElementById("saveFaceLevelBtn").onclick = async (e) => {
		e.preventDefault();
		const count = parseInt(document.getElementById("faceLevelCount").value);
		const items = [];
		for (let i = 0; i < count; i++) {
			const faces = [];
			for (let j = 0; j < 3; j++) {
				const input = document.querySelector(`[name="face${i}_${j}"]`);
				const file = input.files[0];
				if (file) {
					// Upload to Cloudinary
					const data = await uploadImage(file);
					if (data.secure_url) {
						faces.push(data.secure_url);
					} else {
						faces.push("");
					}
				} else if (
					existingData &&
					existingData[i] &&
					existingData[i][j]
				) {
					faces.push(existingData[i][j]);
				} else {
					faces.push("");
				}
			}
			items.push(faces);
		}
		if (userId) {
			await db.ref(`users/${userId}/faceLevel`).set(items);
			await db
				.ref(`users/${userId}/updatedAt`)
				.set(new Date().toISOString());
			alert("Face Level data updated!");
			editUserScreen(userId, {
				...(await db.ref(`users/${userId}`).get()).val(),
			});
		} else {
			const username = document
				.getElementById("usernameInput")
				.value.trim();
			if (!username) {
				alert("Please enter a username.");
				return;
			}
			const now = new Date().toISOString();
			const userRef = db.ref("users").push();
			await userRef.set({
				username,
				createdAt: now,
				updatedAt: now,
				faceLevel: items,
			});
			alert("Face Level data saved!");
			homeScreen();
		}
	};
}

function editUserScreen(userId, userData = {}) {
	// Store userData globally for gameData access in forms
	window.currentUserData = userData;
	appDiv.innerHTML = `
		<h2>Edit User: ${userData.username ? userData.username : userId}</h2>
		<button id="eLevelBtn">E Level</button>
		<button id="colorLevelBtn">Color Level</button>
		<button id="faceLevelBtn">Face Level</button>
		<button id="backBtn">Back</button>
		<div id="levelForm"></div>
	`;
	document.getElementById("eLevelBtn").onclick = () =>
		eLevelForm(userId, userData.eLevel);
	document.getElementById("colorLevelBtn").onclick = () =>
		colorLevelForm(userId, userData.colorLevel);
	document.getElementById("faceLevelBtn").onclick = () =>
		faceLevelForm(userId, userData.faceLevel);
	document.getElementById("backBtn").onclick = listUsersScreen;
}

async function listUsersScreen() {
	appDiv.innerHTML = `<h2>List of Users</h2><ul id="usersList"></ul><button id="backBtn">Back</button>`;
	document.getElementById("backBtn").onclick = homeScreen;
	const usersList = document.getElementById("usersList");
	const snapshot = await db.ref("users").once("value");
	if (snapshot.exists()) {
		const users = snapshot.val();
		// Add SheetJS CDN if not present
		if (!document.getElementById("sheetjs-cdn")) {
			const script = document.createElement("script");
			script.id = "sheetjs-cdn";
			script.src =
				"https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
			document.head.appendChild(script);
		}
		Object.entries(users).forEach(([key, value]) => {
			const li = document.createElement("li");
			const username = value.username || key;
			const createdAt = value.createdAt
				? new Date(value.createdAt).toLocaleString()
				: "-";
			const updatedAt = value.updatedAt
				? new Date(value.updatedAt).toLocaleString()
				: createdAt;
			li.style.position = "relative";
			li.style.background = "#fff";
			li.style.borderRadius = "12px";
			li.style.boxShadow = "0 2px 8px rgba(49,130,206,0.08)";
			li.style.padding = "18px 18px 14px 18px";
			li.style.marginBottom = "18px";
			// Check if user has any game data
			const hasGameData =
				value.gameData &&
				((Array.isArray(value.gameData.e) &&
					value.gameData.e.length > 0) ||
					(Array.isArray(value.gameData.color) &&
						value.gameData.color.length > 0) ||
					(Array.isArray(value.gameData.face) &&
						value.gameData.face.length > 0));
			li.innerHTML = `
				<div style="position:absolute;top:14px;right:14px;display:flex;gap:8px;">
					<button class="exportBtn" style="padding:7px 10px;${
						hasGameData
							? "background:#3182ce;cursor:pointer;"
							: "background:#cbd5e1;cursor:not-allowed;"
					}border:none;border-radius:50%;box-shadow:0 2px 8px rgba(49,130,206,0.08);display:flex;align-items:center;justify-content:center;" title="${
				hasGameData ? "Export Game Data" : "No game data for this user"
			}" ${hasGameData ? "" : "disabled"}>
						<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						  <circle cx="11" cy="11" r="11" fill="${hasGameData ? "#3182ce" : "#cbd5e1"}"/>
						  <path d="M11 6v7m0 0l-3-3m3 3l3-3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<button class="deleteBtn" style="padding:7px 10px;background:#e53e3e;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(229,62,62,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Delete User">
						<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						  <circle cx="11" cy="11" r="11" fill="#e53e3e"/>
						  <path d="M8 11h6M9 8h4m-5 7h6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
				<span style="cursor:pointer;color:#3182ce;text-decoration:underline;">${username}</span><br>
				<small>Created: ${createdAt}</small><br>
				<small>Updated: ${updatedAt}</small>
			`;
			li.querySelector("span").onclick = () => editUserScreen(key, value);
			if (hasGameData) {
				li.querySelector(".exportBtn").onclick = () =>
					exportUserGameData(username, value);
			}
			li.querySelector(".deleteBtn").onclick = () => {
				if (
					confirm(
						`Are you sure you want to delete user '${username}'? This action cannot be undone.`
					)
				) {
					db.ref(`users/${key}`)
						.remove()
						.then(() => {
							alert("User deleted successfully.");
							listUsersScreen();
						});
				}
			};
			usersList.appendChild(li);
		});
		// Export user's gameData to Excel and download
		function exportUserGameData(username, userData) {
			if (!window.XLSX) {
				alert(
					"Excel export library not loaded yet. Please wait a moment and try again."
				);
				return;
			}
			const gameData = userData.gameData || {};
			const sheets = {};
			// E Level
			if (
				gameData.e &&
				Array.isArray(gameData.e) &&
				gameData.e.length > 0
			) {
				sheets["E Level"] = gameData.e.map((item, idx) => ({
					Item: idx + 1,
					ScoreChange: item.scoreChange ?? item.ScoreChange ?? "",
					Attempts: item.attempts ?? "",
					Distance: item.distance ?? "",
				}));
			}
			// Color Level
			if (
				gameData.color &&
				Array.isArray(gameData.color) &&
				gameData.color.length > 0
			) {
				sheets["Color Level"] = gameData.color.map((item, idx) => ({
					Item: idx + 1,
					ScoreChange: item.scoreChange ?? "",
					Attempts: item.attempts ?? "",
					Distance: item.distance ?? "",
				}));
			}
			// Face Level
			if (
				gameData.face &&
				Array.isArray(gameData.face) &&
				gameData.face.length > 0
			) {
				sheets["Face Level"] = gameData.face.map((item, idx) => ({
					Item: idx + 1,
					ScoreChange: item.scoreChange ?? "",
					Attempts: item.attempts ?? "",
					Distance: item.distance ?? "",
				}));
			}
			// Create workbook
			const wb = window.XLSX.utils.book_new();
			Object.entries(sheets).forEach(([sheetName, data]) => {
				const ws = window.XLSX.utils.json_to_sheet(data);
				window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
			});
			// Download
			const fileName = `${username.replace(/\s+/g, "_")}_GameData.xlsx`;
			window.XLSX.writeFile(wb, fileName);
		}
	} else {
		usersList.innerHTML = "<li>No users found.</li>";
	}
}

// Replace with your Cloudinary cloud name and unsigned upload preset
const cloudName = "dpys2kkvc";
const uploadPreset = "prakash";

function uploadImage(file) {
	const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", uploadPreset);

	return fetch(url, {
		method: "POST",
		body: formData,
	}).then((response) => response.json());
}

homeScreen();
