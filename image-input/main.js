//DOM要素の取得
const preview = document.getElementById("preview");
const uploadButton = document.getElementById("upload");
const fileInput = document.getElementById("file-input");
const result = document.getElementById("result");

function startOCR(file) {
	Tesseract.recognize(file, "jpn", { logger: (m) => console.log("tesseract:", m) }).then((ocrResult) => {
		console.log("ocrResult:", ocrResult);
		const text = ocrResult.data.text.replace(/\s+/g, "");
		result.textContent = changeWord(text);
		return text;
	});
}

fileInput.addEventListener("change", (event) => {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			preview.src = e.target.result;
			preview.style.display = "block";
		};
		reader.readAsDataURL(file);
		startOCR(file);
		uploadButton.style.display = "none";
		result.textContent = "loading...";
	} else {
		preview.style.display = "none";
		preview.src = "";
	}
});

function startGetDictionaryList() {
	// changeStatus("辞書リスト読み込み中");
	getDictionaryList();
}
function startGetDictionaryData() {
	// changeStatus("辞書データ読み込み中");
	getDictionaryData();
}

document.addEventListener("dictionaryListLoaded", function () {
	// changeDictionaryOptions();
	startGetDictionaryData();
});
startGetDictionaryList();
