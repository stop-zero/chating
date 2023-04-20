// frontend js

// socket 사용을 위해서 객체 생성
let socket = io.connect();

// 나의 닉네임
let myNick;

// msg count number
// let msgCounter = 1;

function enterkey() {
  if (window.event.keyCode == 13) {
    send();
  }
}

function enterkey2() {
  if (window.event.keyCode == 13) {
    entry();
  }
}

// 메시지 전송 시간
const currentDate = new Date();
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');

const time = `${hours}:${minutes}`;

socket.on('connect', () => {
  console.log('⭕️ Client Socket Connected >> ', socket.id);
});

// [실습1]
// function sayHello() {
//   // clinet -> server 정보 보내기
//   // socket.emit(event, data): 데이터 "전송"
//   // => event 라는 이름으로 data 를 전송
//   socket.emit('hello', { who: 'client', msg: 'hello' });

//   // socket.on(event, callbak): 데이터 "받음"
//   // event에 대해서 정보를 받아 callback 함수 실행
//   socket.on('helloKr', (data) => {
//     const p = document.querySelector('#form-server');
//     p.textContent = `${data.who} : ${data.msg}`;
//   });
// }

// 대화방 날짜
socket.on('date', (Date) => {
  const date = document.getElementById('date');
  date.textContent = `${Date}`;
});

// [실습3] 채팅창 입장/퇴장 안내 문구
socket.on('notice', (msg) => {
  document
    .querySelector('#chat-list')
    .insertAdjacentHTML('beforeend', `<div class="notice">${msg}</div>`);
})

//대화 상대
socket.on('memberList', (msg) => {
  document
    .querySelector('.dropdown-menu')
    .insertAdjacentHTML('beforeend', `<li class="memberList">${msg}</li>`);
});

// [실습3-2]
function entry() {
  console.log(document.querySelector('#nickname').value);

  const inputValue = document.querySelector('#nickname').value;
  if (!inputValue.trim().length) {
    // !false = true
    // input에 입력된 길이가 0이면 그냥 함수 종료
    return;
  }
  //nickname 공백 X
  socket.emit('setNick', document.querySelector('#nickname').value);
}

socket.on('entrySuccess', (nick) => {
  // 1. 내 닉네임 설정
  myNick = nick;

  // 2. 닉네임 입력창 & 버튼 비활성화
  document.querySelector('#nickname').disabled = true; // 입력창 비활성화 (클릭 막기)
  document.querySelector('.entry-box > button').disabled = true; // 버튼 비활성화 (클릭 막기)

  // 3. div.chat-box 요소 보이기
  document.querySelector('.chat-box').classList.remove('d-none');
});

// [실습3-2]
// 닉네임 중복 -> alert 띄우기
socket.on('error', (msg) => {
  alert(msg);
});

// [실습3-2]
// 닉네임 리스트 객체 업데이트하는 이벤트를 받음
socket.on('updateNicks', (obj) => {
  let options = `<option value="all">전체</option>`;

  // select#nick-list 요소의 option 추가
  for (let key in obj) {
    // obj[key] : 유저가 인풋에 입력한 닉네임
    // key : 소켓 아이디
    options += `<option value="${key}">${obj[key]}</option>`;
  }
  console.log(options);

  // select 요소에 options 덮어쓰기
  document.querySelector('#nick-list').innerHTML = options;

  // 대화 목록
  document.querySelector('.dropdown-menu').innerHTML = options;
});

// [실습4] 채팅창 메세지 전송 step1
// "send" 이벤트 전송 { 닉네임, 입력메세지 }
function send() {
  const data = {
    // msgCounter: msgCounter++,
    myNick: myNick,
    dm: document.querySelector('#nick-list').value,
    // => select 태그에서 선택한 option 태그의 value 값
    msg: document.querySelector('#message').value,
    // 메시지 전송 시간
    time: time,
  };

  console.log('>>>', data);

  //공백 문자
  const blank = document.querySelector('#message').value.trim();
  if (blank !== '') {
    socket.emit('send', data);
  }

  document.querySelector('#message').value = ''; // 인풋 초기화
}

// [실습4] 채팅창 메세지 전송 Step2
// 서버에 접속한 모든 클라이언트한테 "누가 뭐라고 말했는지" 이벤트 보내기
socket.on('newMessage', (data) => {
  console.log('socket on newMessage >> ', data); // 새 메세지 정보
  // dm이 아닌 data: { nick: 'aa', msg: 'xxx' }
  // dm인 data: { nick: 'aa', dm: '(속닥속닥) ', msg: 'xxx' }

  // #chat-list 요소 선택 (파란색 박스 = 메세지 상자)
  let chatList = document.querySelector('#chat-list');

  // .my-chat or .other-chat 요소 생성
  let div = document.createElement('div');

  // 가장 안쪽 div 요소 생성
  let divChat = document.createElement('div');

  // #number-list 요소 선택
  // let numList = document.querySelector('.number-list');
  // let div2 = document.createElement('div');
  //msgCounter
  let divNum = document.createElement('divnum');

  //메세지가 생성될 때마다 줄에 번호가 입력되도록.
  let num = div.classList.add('msgCounter');

  //time
  let divtime = document.createElement('div');

  let time = div.classList.add('time');

  // 미션!!
  // 새 메세지가 도착했는데, myNick에 저장된 현재 내 닉네임과
  // data 의 닉네임이 같다면, 내 채팅으로 보이게 (오른쪽 배치 == .my-chat)
  // data 의 닉네임이 다르다면, 상대방 채팅으로 보이게 (왼쪽 배치 == .other-chat)
  if (myNick === data.nick) {
    div.classList.add('my-chat');
    divtime.classList.add('my-chat-time');
  } else {
    div.classList.add('other-chat');
    divtime.classList.add('other-chat-time');
  }

  // [실습5] DM 기능 추가
  if (data.dm) {
    div.classList.add('secret-chat');
    divChat.textContent = data.dm; // divChat 요소에 (속닥속닥) 글자를 추가
  }

  // divChat의 textContent/innerText 값을 적질히 변경
  // ex. nick : msg 형태로 보이게 했음
  // divChat.textContent = `${data.nick} : ${data.msg}`; // [실습4]
  divChat.textContent = divChat.textContent + ` ${data.nick} : ${data.msg}`; // [실습5]
  // dm; divChat.textContent = '(속닥속닥) ' + 누가 : 메세지
  // not dm; divChat.textContet = '' + 누가 : 메세지

  //생성될 때마다 값을 출력.
  // let msgCounter = document.getElementsByClassName('msgCounter').length;
  console.log('msgCounter >> ', data.msgCounter);
  // divNum.textContent = divNum.textContent + `${msgCounter} : ${data.time}`;
  // divNum.textContent = divNum.textContent + `${msgCounter}`;
  divNum.textContent = divNum.textContent + `${data.msgCounter}`;
  div.append(divNum);
  // numList.append(div);

  // divChat 을 div 요소에 추가
  div.append(divChat);
  // div를 chatList 에 추가
  chatList.append(div);

  //time 생성될 때마다 값을 출력.
  divtime.textContent = divtime.textContent + `${data.time}`;
  chatList.append(divtime);

  // (선택) 메세지가 많아져서 스크롤이 생기더라도 하단 고정
  chatList.scrollTop = chatList.scrollHeight;
});

