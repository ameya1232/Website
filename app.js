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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

const appDiv = document.getElementById("app");

function homeScreen() {
	appDiv.innerHTML = `
	<h1>Game Data Manager</h1>
	<button id="createUserBtn">Create User</button>
	<button id="listUsersBtn">List of Users</button>
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
		for (let i = 0; i < count; i++) {
			const val =
				existingData && existingData[i] !== undefined
					? existingData[i]
					: "";
			itemsForm.innerHTML += `
		<div>
		  <label>Item ${
				i + 1
			}: <input type="number" name="item${i}" value="${val}" required> <span>cm</span></label>
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
	  await db.ref(`users/${userId}/updatedAt`).set(new Date().toISOString());
	  alert("E Level data updated!");
	  editUserScreen(userId, {
		...(await db.ref(`users/${userId}`).get()).val(),
	  });
	} else {
	  const username = document.getElementById("usernameInput").value.trim();
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
		eLevel: items
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
		for (let i = 0; i < count; i++) {
			itemsForm.innerHTML += `
		<div>
		  <label>Item ${i + 1}:</label>
		  <div style="display:flex;gap:10px;">
			${[0, 1, 2]
				.map((j) => {
					const val =
						existingData && existingData[i] && existingData[i][j]
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
	  await db.ref(`users/${userId}/updatedAt`).set(new Date().toISOString());
	  alert("Color Level data updated!");
	  editUserScreen(userId, {
		...(await db.ref(`users/${userId}`).get()).val(),
	  });
	} else {
	  const username = document.getElementById("usernameInput").value.trim();
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
		colorLevel: items
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
		for (let i = 0; i < count; i++) {
			itemsForm.innerHTML += `
		<div>
		  <label>Item ${i + 1}:</label>
		  <div style="display:flex;gap:10px;">
			${[0, 1, 2]
				.map((j) => {
					let imgUrl =
						existingData && existingData[i] && existingData[i][j]
							? existingData[i][j]
							: "";
					return `
			  <div style="display:flex;flex-direction:column;align-items:center;">
				<div class="img-square" id="imgPreview${i}_${j}" style="background-image:${
						imgUrl ? `url('${imgUrl}')` : "none"
					}"></div>
				<input type="file" accept="image/*" name="face${i}_${j}">
			  </div>
			`;
				})
				.join("")}
		  </div>
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
					// Upload to Firebase Storage
					const storageRef = storage.ref(
						`faces/${Date.now()}_${file.name}`
					);
					await storageRef.put(file);
					const url = await storageRef.getDownloadURL();
					faces.push(url);
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
	  await db.ref(`users/${userId}/updatedAt`).set(new Date().toISOString());
	  alert("Face Level data updated!");
	  editUserScreen(userId, {
		...(await db.ref(`users/${userId}`).get()).val(),
	  });
	} else {
	  const username = document.getElementById("usernameInput").value.trim();
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
		faceLevel: items
	  });
	  alert("Face Level data saved!");
	  homeScreen();
	}
	};
}

function editUserScreen(userId, userData = {}) {
	appDiv.innerHTML = `
	<h2>Edit User: ${userId}</h2>
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
	Object.entries(users).forEach(([key, value]) => {
	  const li = document.createElement("li");
	  const username = value.username || key;
	  const createdAt = value.createdAt ? new Date(value.createdAt).toLocaleString() : "-";
	  const updatedAt = value.updatedAt ? new Date(value.updatedAt).toLocaleString() : createdAt;
	  li.innerHTML = `<span style="cursor:pointer;color:#3182ce;text-decoration:underline;">${username}</span><br>
		<small>Created: ${createdAt}</small><br>
		<small>Updated: ${updatedAt}</small>`;
	  li.querySelector("span").onclick = () => editUserScreen(key, value);
	  usersList.appendChild(li);
	});
  } else {
	usersList.innerHTML = "<li>No users found.</li>";
  }
}

homeScreen();
