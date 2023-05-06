// frontend js

// socket 사용을 위해서 객체 생성
let socket = io.connect();

// 나의 닉네임
let myNick;


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

// 대화방 날짜
socket.on('date', (Date) => {
  const date = document.getElementById('date');
  date.textContent = `${Date}`;
});

// 채팅창 입장/퇴장 안내 문구
socket.on('notice', (msg) => {
  document
    .querySelector('#chat-list')
    .insertAdjacentHTML('beforeend', `<div class="notice">${msg}</div>`);
});

//대화 상대
socket.on('memberList', (msg) => {
  document
    .querySelector('.dropdown-menu')
    .insertAdjacentHTML('beforeend', `<li class="memberList">${msg}</li>`);
});

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

// 닉네임 중복 -> alert 띄우기
socket.on('error', (msg) => {
  alert(msg);
});

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

// 서버에 접속한 모든 클라이언트한테 "누가 뭐라고 말했는지" 이벤트 보내기
socket.on('newMessage', (data) => {
  console.log('socket on newMessage >> ', data); // 새 메세지 정보

  // #chat-list 요소 선택 (파란색 박스 = 메세지 상자)
  let chatList = document.querySelector('#chat-list');

  // .my-chat or .other-chat 요소 생성
  let div = document.createElement('div');

  // 가장 안쪽 div 요소 생성
  let divChat = document.createElement('div');

  // #number-list 요소 선택

  //msgCounter
  let divNum = document.createElement('divnum');

  //메세지가 생성될 때마다 줄에 번호가 입력되도록.
  let num = div.classList.add('msgCounter');

  //time
  let divtime = document.createElement('div');

  let time = div.classList.add('time');

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

  // DM 기능 추가
  if (data.dm) {
    div.classList.add('secret-chat');
    divChat.textContent = data.dm;
  }

  // divChat의 textContent/innerText 값을 적질히 변경
  divChat.textContent = divChat.textContent + ` ${data.nick} : ${data.msg}`;

  //생성될 때마다 값을 출력.
  console.log('msgCounter >> ', data.msgCounter);
  divNum.textContent = divNum.textContent + `${data.msgCounter}`;
  div.append(divNum);

  // divChat 을 div 요소에 추가
  div.append(divChat);
  // div를 chatList 에 추가
  chatList.append(div);

  //time 생성될 때마다 값을 출력.
  divtime.textContent = divtime.textContent + `${data.time}`;
  chatList.append(divtime);

  // 메세지가 많아져서 스크롤이 생기더라도 하단 고정
  chatList.scrollTop = chatList.scrollHeight;
});
