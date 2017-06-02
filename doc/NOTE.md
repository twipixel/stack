## NOTE

#### 참조

- [Restitution](http://www.html5gamedevs.com/topic/8997-p2-restitution/)
- [Brick Stacker 설명](http://www.html5gamedevs.com/topic/29550-phaser-brick-stacker/)


<br>

#### 일정

- 6월
  - 2 (금) (D8)
  - 5 (월) - WebGL 원인 파악, 일정 산정
  - 6 (화)
  - 7 (수)
  - 8 (목)
  - 9 (금)
  - 12 (월)
  - 13 (화)
  - 14 (수)

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