//DOM要素の取得
const dicSelect = document.getElementById("dic-select");
const enableAI = document.getElementById("enable-ai");
const textArea_wordInput = document.getElementById("word-input");
const textArea_result = document.getElementById("result-text");
const btnSpeak = document.getElementById("spk");
const btnCopy = document.getElementById("copy");
const body = document.querySelector("body");

//定数の宣言
const timeout = 500; //入力が終わってからAI変換を実行するまでの時間

//変数の宣言
let useAI = false;

let counter = 0; //AI変換を実行可能かを判定するためのカウンター

let startTime = 0;

//AI翻訳のチェックボックスのイベントリスナーを設定
enableAI.addEventListener("change", function () {
	if (enableAI.checked) {
		useAI = true;
	} else {
		useAI = false;
	}
});

function changeStatus(status) {
	textArea_result.innerHTML = status;
}

function updateWordAreaHeight() {
	textArea_wordInput.style.height = "auto";
	textArea_wordInput.style.height = textArea_wordInput.scrollHeight + 5 + "px";
}

function removeTooltip() {
	document.querySelectorAll(".tooltip").forEach((tooltip) => {
		tooltip.remove();
	});
}

// ツールチップを作成・更新
function makeTooltip(element) {
	removeTooltip();
	// ツールチップ作成
	const tooltip = document.createElement("div");
	tooltip.className = "tooltip";
	// 返還前の単語
	const originalWord = document.createElement("div");
	originalWord.classList.add("tooltip-original-word");
	originalWord.textContent = element.dataset.original;
	tooltip.appendChild(originalWord);
	// 返還後の単語
	const changedWordList = searchWord(element.dataset.original);
	for (let i = 0; i < changedWordList.length; i++) {
		const changedWord = document.createElement("div");
		changedWord.classList.add("tooltip-changed-word");
		if (changedWordList[i] == element.textContent) {
			changedWord.classList.add("tooltip-changed-word-selected");
		}
		changedWord.textContent = changedWordList[i].mean;
		//todo:typeを表示
		changedWord.addEventListener("click", function (e) {
			element.textContent = this.textContent;
			makeTooltip(element);
		});
		tooltip.appendChild(changedWord);
	}
	tooltip.addEventListener("click", function (e) {
		e.stopPropagation();
	});
	document.body.appendChild(tooltip);

	// 位置計算
	const rect = element.getBoundingClientRect();
	tooltip.style.left = `${rect.left + window.scrollX}px`;
	tooltip.style.top = `${rect.top + window.scrollY + element.offsetHeight + 5}px`;
}

function updateResult(e) {
	if (e.target.value === "") {
		textArea_result.innerHTML = "";
		updateWordAreaHeight();
		return;
	}
	startTime = Date.now();
	// 辞書変換
	textArea_result.innerHTML = changeWord(e.target.value);
	document.querySelectorAll(".changed-word").forEach((element) => {
		element.addEventListener("click", function (e) {
			console.log("変換前:" + this.dataset.original);
			// alert("変換前:" + this.dataset.original);

			e.stopPropagation();

			makeTooltip(element);
		});
	});
	console.log("単語変換時間:", Date.now() - startTime, "ms");
	updateWordAreaHeight();
	// AI変換
	if (useAI) {
		counter++;
		setTimeout(() => {
			counter--;
			if (counter == 0) {
				console.log("AI変換開始:", e.target.value);
				let originalText = e.target.value;
				changeWordWithChatGPT(e.target.value).then((aiConvertedText) => {
					console.log("AI変換結果:", aiConvertedText);
					if (originalText !== e.target.value) {
						console.log("AI変換キャンセル:", originalText, ":", e.target.value);
						return;
					}
					textArea_result.innerHTML = aiConvertedText;
					console.log("AI変換時間:", Date.now() - startTime, "ms");
					updateWordAreaHeight();
				});
			}
		}, timeout);
	}
}

// クリック時にツールチップを削除
document.addEventListener("click", () => {
	removeTooltip();
});

// 再生ボタンのイベントリスナーを設定
btnSpeak.addEventListener("click", function () {
	speak(textArea_result.innerText);
});

// コピーボタンのイベントリスナーを設定
btnCopy.addEventListener("click", function () {
	if (!navigator.clipboard) {
		const tempTextArea = document.createElement("textarea");
		tempTextArea.value = textArea_result.innerHTML;
		document.body.appendChild(tempTextArea);
		tempTextArea.select();
		document.execCommand("copy");
		document.body.removeChild(tempTextArea);
		console.log("Copied text by execCommand:", textArea_result.innerHTML);
		return;
	}
	navigator.clipboard.writeText(textArea_result.innerHTML);
	console.log("Copied text by Clipboard API:", textArea_result.innerHTML);
});

function changeDictionaryOptions() {
	dicSelect.innerHTML = "";
	for (let i = 0; i < dictionaryList.length; i++) {
		const option = document.createElement("option");
		option.value = i;
		option.text = dictionaryList[i].displayName;
		dicSelect.appendChild(option);
	}
}

function startGetDictionaryList() {
	changeStatus("辞書リスト読み込み中");
	getDictionaryList();
}
function startGetDictionaryData() {
	changeStatus("辞書データ読み込み中");
	getDictionaryData();
}

function main() {
	changeStatus("");
	textArea_wordInput.addEventListener("input", updateResult);
}

dicSelect.addEventListener("change", function () {
	dictionaryIndex = dicSelect.selectedIndex;
	getDictionaryData();
});

document.addEventListener("dictionaryDataLoaded", main);
document.addEventListener("dictionaryListLoaded", function () {
	changeDictionaryOptions();
	startGetDictionaryData();
});
startGetDictionaryList();
