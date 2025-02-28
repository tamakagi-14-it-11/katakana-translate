//定数の宣言
apiUrl = "";

//変数の宣言
let dictionaryList = [];
let dictionaryIndex = 0;
let dictionaryData = {};
let dictionaryDataKeys = [];

//イベントの作成
const dictionaryListLoadedEvent = new Event("dictionaryListLoaded");
const dictionaryDataLoadedEvent = new Event("dictionaryDataLoaded");

//辞書リストの読み込み
async function getDictionaryList() {
	console.log("getDictionaryList");
	const url = "../data/dictionary_list.json";
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`レスポンスステータス: ${response.status}`);
		}
		const json = await response.json();
		dictionaryList = json;
		console.log("loaded dictionaryList:", dictionaryList);
		document.dispatchEvent(dictionaryListLoadedEvent);
	} catch (error) {
		console.error(error.message);
	}
}

//辞書データの読み込み
async function getDictionaryData() {
	console.log("getDictionaryData");
	dictionaryData = [];
	dictionaryDataKeys = [];
	const url = "../data/" + dictionaryList[dictionaryIndex].fileName;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`レスポンスステータス: ${response.status}`);
		}
		await extractData(response);
		dictionaryDataKeys = Object.keys(dictionaryData);
		console.log("loaded dictionaryData:", dictionaryData);
		document.dispatchEvent(dictionaryDataLoadedEvent);
	} catch (error) {
		console.error(error.message);
	}
}

async function extractData(response) {
	if (dictionaryList[dictionaryIndex].contentType == "application/json") {
		const json = await response.json();
		//使用するデータのみを抽出
		for (let i = 0; i < json.length; i++) {
			// console.log("読み込み:",i, json[i][0], json[i][1].split("//")[0]);
			dictionaryData[json[i][0]] = json[i][1].split("//")[0];
		}
	} else if (dictionaryList[dictionaryIndex].contentType == "text/csv") {
		const text = await response.text();
		const lines = text.split(/\r\n|\n|\r/);
		lines.splice(0, 1); //ヘッダー行を削除
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].split(",");
			if (line.length < 2) {
				continue;
			}
			dictionaryData[line[0]] = line[1];
		}
	} else {
		throw new Error(`未対応のファイル形式です:` + dictionaryList[dictionaryIndex].contentType);
	}
}

//辞書データを使用して変換
function changeWord(text) {
	let result = text;
	dictionaryDataKeys.forEach(function (word) {
		if (result.indexOf(word) != -1) {
			result = result.replaceAll(word, dictionaryData[word]);
		}
	});
	return result;
}

// chatGPTを使用して変換
async function changeWordWithChatGPT(text) {
	if(!apiUrl){
		console.error("AIを使用した変換は現在利用できません");
		return text;
	}
	const params = new URLSearchParams({ text: text });
	const url = `${apiUrl}?${params.toString()}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`レスポンスステータス: ${response.status}`);
		}
		const json = await response.json();
		if (!json.status) {
			throw new Error(`no response status`);
		} else if (json.status != "success") {
			throw new Error(`APIエラー: ${json.status} : ${json.message}`);
		}
		return json.data;
	} catch (error) {
		console.error("chatGPT変換エラー:", error.message);
		return text; // エラーが発生した場合は元のテキストを返す
	}
}

//weblio類語検索
function searchSynonymByWeblio(word) {
	const url = `https://thesaurus.weblio.jp/content/${word}`;
	console.log("url:", url);
	window.open(url, "_blank");
}

//weblio類語から類語を取得
function getSynonymFromWeblio(word) {
	const url = `https://script.google.com/macros/s/AKfycbwFgACr5iqBSTL8Rb_PjiJi2VwcYOLCFCIeNrMWXf_qJ3eLKmevAgbVCjgfFQnTnheMuw/exec?data=${word}`;
	console.log("url:", url);
	fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`レスポンスステータス: ${response.status}`);
			}
			return response.json();
		})
		.then((json) => {
			// console.log("json:", json);
			if (json.status != "success") {
				throw new Error(`json.status: ${json.status}`);
			}
			if (json.data.length == 0) {
				console.log("類語が見つかりませんでした");
			} else {
				console.log("synonym:", json.data);
			}
			return json;
		})
		.catch((error) => {
			console.error(error.message);
		});
}

function makeCsv() {
	let csv = dictionaryList[dictionaryIndex]["displayName"] + ",日本語\n";
	for (let i = 0; i < dictionaryDataKeys.length; i++) {
		csv += dictionaryDataKeys[i] + "," + dictionaryData[dictionaryDataKeys[i]] + "\n";
	}
	console.log(csv);
}

//デバッグ用
function testChangeWordWithChatGPT(text) {
	changeWordWithChatGPT(text)
		.then((result) => {
			console.log("変換後テキスト:", result);
		})
		.catch((error) => {
			console.error(error.message);
		});
}

//読み上げの設定
let voices = [];
const speechSynthesis = window.speechSynthesis;
speechSynthesis.onvoiceschanged = (e) => {
	voices = speechSynthesis.getVoices();
};
const utter = new SpeechSynthesisUtterance();
utter.lang = "ja-JP";

function speak(text) {
	if (voices.length == 0) {
		// console.error("音声合成エラー: 音声データが読み込まれていません");
		// return;
	} else if (voices.length < 4) {
		utter.voice = voices[0];
	} else {
		utter.voice = voices[3];
	}
	utter.volume = 1;
	utter.text = text;
	speechSynthesis.speak(utter);
}
