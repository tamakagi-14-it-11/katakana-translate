//DOM要素の取得
const dicSelect = document.getElementById("dic-select");
const userDic = document.getElementById("user-dic");
const addDic = document.getElementById("add-dic");
const originalWords = document.getElementById("original-words");
const mean = document.getElementById("mean");
const addFrame = document.getElementById("add-frame");
const delFrame = document.getElementById("del-frame");
const saveButton = document.getElementById("save");
const loadButton = document.getElementById("load");

//変数の宣言
let userDictionalyList = [];

//枠の追加
function add(word, mean) {
	let tr = document.createElement("tr");
	for (let i = 0; i < 2; i++) {
		let td = document.createElement("td");
		let inp = document.createElement("input");
		inp.addEventListener("input", function () {
			save();
			console.log("保存しました");
		});
		td.appendChild(inp);
		tr.appendChild(td);
	}
	tr.cells[0].children[0].value = word;
	tr.cells[1].children[0].value = mean;
	addDic.appendChild(tr);
}

addFrame.addEventListener("click", function () {
	add("", "");
});

//枠の削除
function del() {
	let rw = addDic.rows.length;
	if (rw > 2) {
		addDic.deleteRow(rw - 1);
	}
}

delFrame.addEventListener("click", del);

//表から要素を取得し，ローカルストレージに保存
function save() {
	userDictionalyList = [];
	for (let i = 1; i < addDic.rows.length; i++) {
		let word = addDic.rows[i].cells[0].children[0].value;
		let mean = addDic.rows[i].cells[1].children[0].value;
		userDictionalyList.push({ word: word, mean: mean });
	}
	localStorage.dicData = JSON.stringify(userDictionalyList);
	console.log("保存しました");
}

saveButton.addEventListener("click", save);

//ローカルストレージから取得し，表に表示
function load() {
	if (!localStorage.dicData) {
		return;
	}
	while (addDic.rows.length > 1) {
		addDic.deleteRow(1);
	}
	let storedList = JSON.parse(localStorage.dicData); // 修正: キーを追加
	if (storedList) {
		userDictionalyList = storedList;
		for (let i = 0; i < userDictionalyList.length; i++) {
			add(userDictionalyList[i].word, userDictionalyList[i].mean);
		}
	}
}

loadButton.addEventListener("click", load);
window.onload = load;
