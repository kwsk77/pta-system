const firebaseConfig = {
  apiKey: "AIzaSyCwhyOi48BcAV3d6MissYakO6rGxrHZ0fc",
  authDomain: "pta-members.firebaseapp.com",
  projectId: "pta-members",
  storageBucket: "pta-members.firebasestorage.app",
  messagingSenderId: "546885510488",
  appId: "1:546885510488:web:cac7263dabad935c5f312d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 子ども追加
document.getElementById("addChild").addEventListener("click", () => {
  const childrenDiv = document.getElementById("children");
  const firstChild = childrenDiv.querySelector(".child");
  const newChild = firstChild.cloneNode(true);

  // 入力値をクリア
  newChild.querySelectorAll("input").forEach(input => {
    input.value = "";
    if (input.type === "radio") input.checked = false;
  });

  childrenDiv.appendChild(newChild);

  // 🔥 子どもごとにラジオボタン name を振り直す
  [...document.querySelectorAll(".child")].forEach((child, index) => {
    child.querySelectorAll('input[name^="joinPta"]').forEach(r => {
      r.name = `joinPta_${index}`;
    });
    child.querySelectorAll('input[name^="joinKyosai"]').forEach(r => {
      r.name = `joinKyosai_${index}`;
    });
  });
});

// 送信処理（1つだけ）
document.getElementById("ptaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const parentName = form.parentName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();

  // 🔥 保護者名チェック
  if (parentName === "") {
    alert("保護者名を入力してください。");
    return;
  }

  // 🔥 メール未入力チェック
  if (email === "") {
    alert("メールアドレスを入力してください。");
    return;
  }

  // 🔥 メール形式チェック
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("メールアドレスの形式が正しくありません。");
    return;
  }

  // 🔥 電話番号チェック
  if (phone === "") {
    alert("電話番号を入力してください。");
    return;
  }

  // 🔥 子ども情報（PTA/共済を子どもごとに取得）
  const children = [...document.querySelectorAll(".child")].map((c, index) => ({
    name: c.querySelector("[name=childName]").value.trim(),
    grade: c.querySelector("[name=grade]").value.trim(),
    class: c.querySelector("[name=class]").value.trim(),
    studentId: c.querySelector("[name=studentId]").value.trim(),
    joinPta: document.querySelector(`input[name="joinPta_${index}"]:checked`)?.value === "yes",
    joinKyosai: document.querySelector(`input[name="joinKyosai_${index}"]:checked`)?.value === "yes"
  }));

  // 🔥 子どもが1人も入力されていない場合
  const validChildren = children.filter(c =>
    c.name !== "" &&
    c.grade !== "" &&
    c.class !== "" &&
    c.studentId !== ""
  );

  if (validChildren.length === 0) {
    alert("最低でも1人の子どもの情報を入力してください。");
    return;
  }

  // 🔥 安互（保護者のみ）
  const joinAngo = document.querySelector('input[name="joinAngo"]:checked')?.value === "yes";

  const data = {
    parentName,
    email,
    phone,
    children: validChildren,
    joinAngo,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Firestore 保存
  await db.collection("pta_memberships/2026/entries").add(data);

  // 完了ページへ
  window.location.href = "thanks.html";
});

// 子ども削除
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("removeChild")) {
    const allChildren = document.querySelectorAll(".child");

    // 最低1人は残す
    if (allChildren.length === 1) {
      alert("子どもは最低1人必要です。");
      return;
    }

    e.target.closest(".child").remove();
  }
});
