## NOTE

#### 참조

- 게임
  - [BrickStacker](http://game.guinnessworldrecords.com/)
  - [Brick Stacker 설명](http://www.html5gamedevs.com/topic/29550-phaser-brick-stacker/)
- Stacking 이론
  - [Block-stacking problem](https://en.wikipedia.org/wiki/Block-stacking_problem)
  - [Book Stacking](https://www.youtube.com/watch?v=CdhuVhWTSMI)


<br>

#### 이슈

- 화면 사이즈 때문에 성능이 너무 느려진다.

<br>

#### 일정

- 6월
  - 2 (금) (D8)
  - 5 (월) - WebGL 원인 파악, 일정 산정
  - 6 (화) - 현충일
  - 7 (수) - WebGL 바닥 부터 새로 생성 해서 오류 파악
  - 8 (목) - 밸런스 로직 계산
  - 9 (금) - 모바일 터치 적용 (자동으로 해주네요)
  - 12 (월) - 카메라 이동
  - 13 (화) - 밸런스 무너 졌을 때 블럭 처리 (회전)
  - 14 (수) - 
  - 15 (목) - swing 에 sin, cos 추가

<br>

#### 버그

- overhang 넘쳤다는 오류가 있습니다.
  - 계속 일직선으로 쌓다 보면 발생하는거 같아요.
- 2개 연속적으로 쌓으면 오류 발생
  - 한개씩 쌓을 수 있도록 처리 필요

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

  ​