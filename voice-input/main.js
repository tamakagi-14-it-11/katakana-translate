//DOM要素の取得
const dicSelect = document.getElementById("dic-select");
const textArea_status = document.getElementById("status");
const textArea_result = document.getElementById("result");
const btnRecStart = document.getElementById("rec-start");
const btnRecStop = document.getElementById("rec-stop");
const btnText = document.getElementById("text");
const btnVolOn = document.getElementById("vol-on");
const btnVolOff = document.getElementById("vol-off");
const body = document.querySelector("body");

//定数の宣言
const useAI = false;

//変数の宣言
let isReadingModeOn = false;

//音声認識の変数
let translatedText = "";
let awaitingText = "";

//音声認識の設定
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rec = new SpeechRecognition();
rec.lang = "ja-JP";
rec.interimResults = true;
rec.continuous = true;
rec.onsoundstart = function () {
	changeStatus("認識中");
	changeBackgroundColor("#88f");
};
rec.onnomatch = function () {
	changeStatus("もう一度試してください");
};
rec.onerror = function (event) {
	console.error("音声認識エラー:", event.error);
	changeStatus("音声認識エラー");
	changeBackgroundColor("#f88");
};
rec.onsoundend = function () {
	changeStatus("停止中");
	changeBackgroundColor("#fff");
};
rec.onresult = function (event) {
	const results = event.results;
	for (let i = event.resultIndex; i < results.length; i++) {
		if (results[i].isFinal) {
			const newText = String(results[i][0].transcript);
			const convertedText = changeWord(newText);
			awaitingText += convertedText + "<br>";
			updateResult();
			if (useAI) {
				// AI変換を非同期で行う
				changeWordWithChatGPT(newText).then((aiConvertedText) => {
					let updateFlag = false;
					if (textArea_result.innerHTML == translatedText + awaitingText) {
						updateFlag = true;
					}
					// 既存のテキストにAI変換されたテキストを追加
					translatedText += aiConvertedText + "<br>";
					// 読み上げモードがONの場合、AI変換されたテキストを読み上げる
					if (isReadingModeOn) {
						speak(aiConvertedText);
					}
					awaitingText = awaitingText.replace(convertedText + "<br>", "");
					if (updateFlag) {
						updateResult();
					}
				});
			} else {
				translatedText += awaitingText;
				awaitingText = "";
				// 読み上げモードがONの場合、AI変換されたテキストを読み上げる
				if (isReadingModeOn) {
					speak(convertedText);
				}
				updateResult();
			}
		} else {
			updateResult(results[i][0].transcript);
		}
	}
	autoScroll();
};
// rec.onend = function () {
// 	rec.start();
// };

//自動スクロール
function autoScroll() {
	window.scrollTo({
		top: document.body.scrollHeight,
		left: 0,
		behavior: "smooth",
	});
}

function updateResult(text = "") {
	textArea_result.innerHTML = translatedText + awaitingText + text;
}
function changeStatus(status) {
	textArea_status.innerHTML = status;
}
function changeBackgroundColor(color) {
	body.style.backgroundColor = color;
}
function changeDictionaryOptions() {
	dicSelect.innerHTML = "";
	for (let i = 0; i < dictionaryList.length; i++) {
		const option = document.createElement("option");
		option.value = i;
		option.text = dictionaryList[i].displayName;
		dicSelect.appendChild(option);
	}
}

//音声認識ボタンの表示切り替え
function showBtnRecStop() {
	btnRecStart.style.display = "none";
	btnRecStop.style.display = "block";
}
function showBtnRecStart() {
	btnRecStart.style.display = "block";
	btnRecStop.style.display = "none";
}

//音声認識の開始と停止
function startRec() {
	rec.start();
	showBtnRecStop();
	changeStatus("待機中");
	if (voices.length == 0) {
		let dummyUtter = new SpeechSynthesisUtterance("");
		dummyUtter.volume = 0;
		speechSynthesis.speak(dummyUtter);
	}
}
function stopRec() {
	rec.stop();
	showBtnRecStart();
	changeStatus("停止中");
	changeBackgroundColor("#fff");
}

//volボタンの表示切り替え
function showBtnVolOff() {
	btnVolOn.style.display = "none";
	btnVolOff.style.display = "block";
}
function showBtnVolOn() {
	btnVolOn.style.display = "block";
	btnVolOff.style.display = "none";
}

//読み上げモードの開始と停止
function volOn() {
	isReadingModeOn = true;
	showBtnVolOn();
}
function volOff() {
	isReadingModeOn = false;
	showBtnVolOff();
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
	changeStatus("準備完了");
	//ボタンの動作を設定
	btnRecStart.addEventListener("click", startRec);
	btnRecStop.addEventListener("click", stopRec);
	btnVolOn.addEventListener("click", volOff);
	btnVolOff.addEventListener("click", volOn);
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
