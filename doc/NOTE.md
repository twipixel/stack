## NOTE

#### 참조

- 참조 게임
  - [BrickStacker](http://game.guinnessworldrecords.com/)
  - [Brick Stacker 설명](http://www.html5gamedevs.com/topic/29550-phaser-brick-stacker/) 
- Stacking 이론
  - [Block-stacking problem](https://en.wikipedia.org/wiki/Block-stacking_problem)
  - [Book Stacking](https://www.youtube.com/watch?v=CdhuVhWTSMI)
- Phaser 이해
  - [Game States 에 대한 좋은 설명](http://www.emanueleferonato.com/2014/08/28/phaser-tutorial-understanding-phaser-states/)


<br>

#### 컨셉

- 오진 파워 컨샙!!
- 블럭 쌓을 때 뙇! 뙇! 시원한 느낌을 주도록 가자!
- 잘못 쌓을 때도 팡팡 터지도록 처리
- 쌓아서 기분 좋고 넘어져도 좋고
- 점수 받았을 때 기분도 좋게 점수 이펙트 팍팍 줍시다!
- 소리 볼링공 터지는 소리 처럼 시원한 소리로 무장
- 올 여름은 내가 강타한다!

<br>

#### TODO

- 점수 이펙트
- 점수 카운팅

<br>

#### 피쳐

- Play
  - 시작 화면 꾸미기
  - ~~높이 자 그리기~~
    - 자에 눈금으로 하지 말고 Level 을 표시하는게 좋겠다. Level 1 또는 Easy
    - WarmingUp, Easy, Normal, Hard, Crazy 5개 레벨
  - 블럭 디자인 
  - ~~블럭 쌓기 성공 시 이펙트~~
    - ~~블럭 모양으로 위로 빛이 올라가는 이펙트~~
    - ~~그리고 그 모양이 유지 (가이드 라인)~~
  - 블럭 HIT 이펙트
    - 파티클이나 블럭 사이에서 뭐가 나오던지 이펙트 추가 해봅시다.
  - ~~게임 종료 처리~~
    - ~~No hit~~
    - ~~Overhang~~
    - ~~drop 블럭이 내려 찍도록 물리 처리~~
    - ~~**drop 블럭이 내려 찍으면 터지는 블럭끼리 부딪히는 소리 내도록 처리(굳이 안해도 되겠어요?)**~~
  - ~~모바일에서 느린 이유 찾기~~
  - ~~게임 종료 시 checkBlance, gameOver 함수 비활성화~~
  - ~~블럭이 다 떨어지기 전까지 블럭 생성하지 않도록 처리~~
  - ~~특정 키 (CONTROL) 를 누르면 블럭이 슬로우 모션 하도록~~
  - ~~점수 계산~~
    - 위 아래 블럭의 중심점의 거리 차이
      - 0 Perfect (10점)
      - 1 ~ 5 사이 Excellent (5점)
      - 1 ~ 10 사이 Good (3점)
      - 10픽셀 이상 차이나면 (1점)
  - 점수 이펙트
    - Perfect 일때 슬로우 모션으로 딱 들어가는 것을 보여주자!
    - 점수는 어떻게 표현할까!
  - ~~레벨 적용~~
    - ~~블럭 넓이 조절~~
    - ~~swing 스피드 조절~~
  - ~~시간 패널티 적용~~
    - ~~swing 스피드 조절~~
  - 계산 최적화 (계산값을 축척해 놓는 방식)
  - ~~게임 종료 카메라 페이드 아웃 처리~~
  - gameOverSlowMotion 에서 히트 감지하고 brick.y 를 다시 위로 보내는게 어색한 부분 수정하기
    - 충돌이 미리 감지 가능하니까 위에서 블럭 보내는 위치를 수정해보자.
- Score
  - 재시작 추가
  - [삭제 로직 확인 (메모리)](http://www.emanueleferonato.com/2014/08/28/phaser-tutorial-understanding-phaser-states/)
    - 헐 Phaser가 알아서 처리해 주네요. 대박
    - this.game.state.start("GameOver",true,false,score);
      - second argument 는 clearWorld, 기본적으로 true
        - and clears the World display list fully (but not the Stage, so if you've added your own objects to the Stage they will need managin directly)
      - third argument 는 clearCache, 기본적으로 false
        - and clears all loaded assets. You won't use it that often as we want to keep loaded assets.
      - all other parameters from the fourth are variables that will be passed to the init function (if it has one). So I am going to pass the score to GameOver state, have a loo, at gameover.js
  - 공유하기 연동
  - 배포 페이지 적용
- 메인 연동
- 디자인 적용
- 사운드 적용

<br>

#### 오류

- overhang 넘쳤다는 오류가 있습니다.
  - 계속 일직선으로 쌓다 보면 발생하는거 같아요.
- ~~2개 연속적으로 쌓으면 오류 발생~~
  - ~~한개씩 쌓을 수 있도록 처리 필요~~
- ~~높게 쌓았을 때 무너지는게 이상합니다. (그냥 땅으로 꺼지는 느낌)~~
- 오른쪽으로만 쌓다보면 무너질거 같은데 안무너짐? (이건 좀 고민해보자)
- blance 로직에서 블럭이 반넘게 걸쳐 있으면 무조건 떨어지도록 수정이 필요
  - 한 가운데 6개 정도 쌓고 반이상 나가도록 쌓으면 쌓아집니다.
    - 한 가운데 쌓으면 즉 스코어 되면 방향을 바꾼것 처럼 overhang 을 리셋 시키자

<br>


#### 물리 버전

- 블럭 생성
- 블럭 이동
- 키 입력으로 블럭 다운
- y 카메라 이동
- 쌓기 성공 시 
  - 이펙트
  - 효과음
  - 점수 계산
  - 점수 표시
- 블럭이 무너지는 것 체크
- 물리값 조절

<br>

- [P2](https://www.slideshare.net/pashaklimenkov/game-physics-35565076)

  - Demo
    - [Totem Destroyer](http://www.emanueleferonato.com/2014/04/21/html5-totem-destroyer-fully-working-prototype-using-phaser/)
    - [A simple simulation](http://spiking-neural.net/Basic_Physics_Simulation.html)


- Sprite
    - unbreakable
    - data
      - gravityScale
- P2
    - gravity
    - enable(sprite)
    - setWorldMaterial
    - createMaterial
    - createContactMaterial
- Body
    - 속성
      - static
      - mass 질량
      - velocity 속도
      - angularVelocity
        - The angular velocity of the body.
      - damping 
        - Damping is specified as a value between 0 and 1, which is the proportion of velocity lost per second. The linear damping acting on the body in the velocity direction.
      - angularDamping
        - Damping is specified as a value between 0 and 1, which is the proportion of velocity lost per second. The angular damping acting acting on the body.
      - allowSleep
      - gravity
    - 함수
      - setZeroVelocity
- [ContactMaterial](http://examples.phaser.io/_site/view_full.html?d=p2%20physics&f=contact+material.js&t=contact%20material)
    - friction - 마찰
      - // Friction to use in the contact of these two materials.
    - restitution - bounce
      - // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
    - stiffness - 단단함 (장력)
      - // Stiffness of the resulting ContactEquation that this ContactMaterial generate.
    - relaxation - 완화
      - // Relaxation of the resulting ContactEquation that this ContactMaterial generate.
    - frictionStiffness
      - // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    - frictionRelaxation
      - // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    - surfaceVelocity
      - // Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.


<br>


#### 계산 버전

- 블럭 생성
- 블럭 이동
- 키 입력으로 블럭 다운
- 블럭 쌓기
- y 카메라 이동
- 높이 제한이 어디까지 인가?
- balance 체크 로직
- weakpoint 로직

<br>

#### 사운드

- [freesound.org](https://www.freesound.org)
- [Baseball Sound](https://www.freesoundeffects.com/free-sounds/baseball-10099/)
- [Bowling Strike Free](https://www.freesoundeffects.com/free-sounds/bowling-10102/)
- [Bowling Strike Pond5](https://www.pond5.com/sound-effect/66804939/sports-bowling-strike-single-pins-hard-clunk-rattle-loose-ti.html)