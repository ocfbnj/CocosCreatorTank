import Game from "./Game";
import PlayerTank from "./PlayerTank";
import { Globals, Dir } from "./Globals";
import Bullet from "./Bullet";
import EnemyTank from "./EnemyTank";
import BlockWall from "./BlockWall";
import BaseTank from "./BaseTank";
import UpdateInformations from "./UpdateInformations";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapLayer extends cc.Component {

    @property(cc.Prefab)
    blockWall: cc.Prefab = null;

    @property(cc.Prefab)
    blockStone: cc.Prefab = null;

    @property(cc.Prefab)
    blockForest: cc.Prefab = null;

    @property(cc.Prefab)
    blockIce: cc.Prefab = null;

    @property(cc.Prefab)
    blockRiver: cc.Prefab = null;

    @property(cc.Prefab)
    enemy: cc.Prefab = null;

    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    @property(Game)
    game: Game = null;

    @property(PlayerTank)
    player: PlayerTank = null;

    blocks: any[];
    enemiesBullets: cc.Node[];
    playerBullets: cc.Node[];
    enemies: cc.Node[];
    bulletPool: cc.NodePool;
    enemiesPool: cc.NodePool;
    remainEnemiesCount: number;

    init() {
        // 清理子节点
        for (const node of this.node.children) {
            if (node.name == "player") {
                node.getComponent(PlayerTank).init();
            } else if (node.name == "camp") {
                // 什么都不做
            } else {
                node.destroy();
            }
        }
        // 所有障碍方块
        this.blocks = [];
        // 敌人子弹
        this.enemiesBullets = [];
        // 玩家子弹
        this.playerBullets = [];
        // 敌人坦克
        this.enemies = [];

        // 子弹节点池
        this.bulletPool = new cc.NodePool();
        // 敌人节点池
        this.enemiesPool = new cc.NodePool();

        this.remainEnemiesCount = Globals.ENEMIES_COUNT;

        // 加载地图
        this._loadMap();

        this.spawnNewEnemy();

        // 开启计时器自动生成敌人
        this.schedule(this.spawnNewEnemy, 4.5);

        // 检查游戏是否胜利
        this.schedule(() => {
            if (this.enemies.length == 0 && this.remainEnemiesCount == 0) {
                this.unscheduleAllCallbacks();
                // 两秒后跳转到下一关
                this.scheduleOnce(this.toNextStage, 2);
            }
        }, 0.1);
    }

    createBullet(dir: Dir, pos: cc.Vec3, step: number, tank: BaseTank) {
        if (tank.bulletCount <= 0)
            return;

        let bullet = null;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get();
        } else {
            bullet = cc.instantiate(this.bullet);
        }

        if (tank.isEnemy)
            this.enemiesBullets.push(bullet);
        else {
            this.game.playAudio("shoot", false);
            this.playerBullets.push(bullet);
        }

        bullet.parent = this.node;
        bullet.getComponent(Bullet).init(dir, pos, step, tank);
    }


    destoryBullet(bullet: cc.Node, isEnemy: any) {
        if (isEnemy)
            this.enemiesBullets.splice(this.enemiesBullets.indexOf(bullet), 1);
        else
            this.playerBullets.splice(this.playerBullets.indexOf(bullet), 1);

        this.bulletPool.put(bullet)
    }

    spawnNewEnemy() {
        if (this.enemies.length >= 6)
            return;

        if (this.remainEnemiesCount <= 0)
            return;

        if (this.remainEnemiesCount == Globals.ENEMIES_COUNT) {
            this.createEnemy(Globals.ENEMY1);
            this.createEnemy(Globals.ENEMY2);
            this.createEnemy(Globals.ENEMY3);
        } else if (this.remainEnemiesCount > 0) {
            let choice = Math.floor(Math.random() * 3);
            let pos: cc.Vec2;

            if (choice == 0) {
                pos = Globals.ENEMY1;
            } else if (choice == 1) {
                pos = Globals.ENEMY2;
            } else {
                pos = Globals.ENEMY3;
            }

            if (this._canSpawnTank(pos)) {
                this.createEnemy(pos);
            }
        } else {
            // 取消计时器
            this.unschedule(this.spawnNewEnemy);
        }
    }

    createEnemy(pos: cc.Vec2) {
        let enemy = null;
        if (this.enemiesPool.size() > 0) {
            enemy = this.enemiesPool.get();
        } else {
            enemy = cc.instantiate(this.enemy);
        }

        this.enemies.push(enemy);
        enemy.parent = this.node;
        enemy.getComponent(EnemyTank).init(pos);

        // 更新信息区域
        cc.find("/Game/Informations").getComponent(UpdateInformations).deleteOneIcon();

        this.remainEnemiesCount--;
    }


    destoryEnemy(enemy: cc.Node) {
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        this.enemiesPool.put(enemy);
    }

    toNextStage() {
        let game = cc.find("Game").getComponent(Game);
        game.level++;

        game.init();
    }

    _loadMap() {
        // 显示大本营
        this._loadMapData();
    }

    _loadMapData() {
        let self = this;

        cc.loader.loadRes("maps/" + this.game.level, function (err, file) {
            let data = file.text;
            let index = 0;

            for (let i = 0; i != 26; i++) {
                for (let j = 0; j != 26; j++) {
                    let block: cc.Node = null;

                    switch (data[index++]) {
                        case '3':
                            block = cc.instantiate(self.blockWall);
                            block.name = "block_wall";
                            block.getComponent(BlockWall).init();
                            self.blocks.push(block);
                            break;
                        case '5':
                            block = cc.instantiate(self.blockStone);
                            block.name = "block_stone";
                            self.blocks.push(block);
                            break;
                        case '1':
                            block = cc.instantiate(self.blockForest);
                            block.zIndex = cc.macro.MAX_ZINDEX;
                            break;
                        case '2':
                            block = cc.instantiate(self.blockIce);
                            block.zIndex = self.player.node.zIndex - 1;
                            break;
                        case '4':
                            block = cc.instantiate(self.blockRiver);
                            block.getComponent(cc.Animation).play("river");
                            self.blocks.push(block);
                            break;
                        default:
                            break;
                    }

                    if (block) {
                        block.parent = self.node;
                        block.setAnchorPoint(0, 0);
                        block.setPosition(j * Globals.BLOCK_SIZE, (25 - i) * Globals.BLOCK_SIZE);
                    }
                }
            }
        });
    }

    _canSpawnTank(pos: { x: number; y: number; }) {
        let box = new cc.Rect(
            pos.x - Globals.TANK_SIZE / 2 - 1,
            pos.y - Globals.TANK_SIZE / 2 - 1,
            Globals.TANK_SIZE,
            Globals.TANK_SIZE
        );

        let tanks = this.enemies;
        let player = this.player.node;

        for (let i = 0; i != tanks.length; i++) {
            if (tanks[i].getBoundingBox().intersects(box))
                return false;
        }

        if (player.getBoundingBox().intersects(box))
            return false;

        return true;
    }
}
