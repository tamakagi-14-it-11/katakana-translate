//DOM要素の取得
const dicSelect = document.getElementById("dic-select");
const textArea_wordInput = document.getElementById("word-input");
const textArea_result = document.getElementById("result-text");
const btnSpeak = document.getElementById("spk");
const btnCopy = document.getElementById("copy");
const body = document.querySelector("body");

//定数の宣言
const useAI = false;
const timeout = 500;
//定数の宣言
let counter = 0; //AI変換を実行可能かを判定するためのカウンター

function changeStatus(status) {
	textArea_result.innerHTML = status;
}

function updateWordAreaHeight() {
	textArea_wordInput.style.height = "auto";
	textArea_wordInput.style.height = textArea_wordInput.scrollHeight + 5 + "px";
}

function updateResult(e) {
	if (e.target.value === "") {
		textArea_result.innerHTML = "";
		updateWordAreaHeight();
		return;
	}
	textArea_result.innerHTML = changeWord(e.target.value);
	updateWordAreaHeight();
	if (useAI) {
		counter++;
		setTimeout(() => {
			counter--;
			if (counter == 0) {
				console.log("AI変換開始:", e.target.value);
				changeWordWithChatGPT(e.target.value).then((aiConvertedText) => {
					console.log("AI変換結果:", aiConvertedText);
					textArea_result.innerHTML = aiConvertedText;
					updateWordAreaHeight();
				});
			}
		}, timeout);
	}
}

//ボタンのイベントリスナーを設定
btnSpeak.addEventListener("click", function () {
	speak(textArea_result.innerHTML);
});

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
