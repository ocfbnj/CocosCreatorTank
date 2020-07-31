import Game from "./Game";
import { Globals, Dir } from "../Globals";
import Bullet from "./Bullet";
import EnemyTank from "./EnemyTank";
import BlockWall from "./BlockWall";
import BaseTank from "./BaseTank";
import UpdateInformations from "./UpdateInformations";
import AudioMng from "../AudioMng";
import PlayerTank from "./PlayerTank";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapLayer extends cc.Component {
    // 节点
    @property(cc.Node)
    players: cc.Node = null;
    @property(cc.Node)
    enemies: cc.Node = null;
    @property(cc.Node)
    blocks: cc.Node = null;
    @property(cc.Node)
    enemiesBullets: cc.Node = null;
    @property(cc.Node)
    playerBullets: cc.Node = null;

    // 预制资源
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
    player1: cc.Prefab = null;
    @property(cc.Prefab)
    player2: cc.Prefab = null;
    @property(cc.Prefab)
    enemy: cc.Prefab = null;
    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    _game: Game;
    _audioMng: AudioMng;
    _bulletPool: cc.NodePool;
    _enemiesPool: cc.NodePool;
    _remainEnemiesCount: number;

    createBullet(dir: Dir, pos: cc.Vec3, step: number, tank: BaseTank) {
        if (tank.bulletCount <= 0)
            return;

        let bullet: cc.Node;

        if (this._bulletPool.size() > 0) {
            bullet = this._bulletPool.get();
        } else {
            bullet = cc.instantiate(this.bullet);
        }

        if (tank.isEnemy) {
            bullet.parent = this.enemiesBullets;
        } else {
            this._audioMng.playAudio("shoot", false);
            bullet.parent = this.playerBullets;
        }

        bullet.getComponent(Bullet).init(dir, pos, step, tank);
    }

    destoryBullet(bullet: cc.Node, isEnemy: any) {
        this._bulletPool.put(bullet)
    }

    destoryEnemy(enemy: cc.Node) {
        this._enemiesPool.put(enemy);
    }

    init() {
        this._remainEnemiesCount = Globals.ENEMIES_COUNT;

        // 清理子节点
        this._cleanChildNode();

        // 加载地图
        this._loadMap();

        // 生成敌人
        this.spawnNewEnemy();

        // 初始化玩家
        for (const player of this.players.children) {
            player.getComponent(PlayerTank).reset();
        }

        // 每隔4.5秒生成一个敌人
        this.schedule(this.spawnNewEnemy, 4.5);

        // 检查游戏是否胜利
        this.schedule(() => {
            if (this.enemies.childrenCount == 0 && this._remainEnemiesCount == 0) {
                this.unscheduleAllCallbacks();
                // 两秒后跳转到下一关
                this.scheduleOnce(this.toNextStage, 2);
            }
        }, 0.1);
    }

    onLoad() {
        this._game = cc.find("/Game").getComponent(Game);
        this._audioMng = cc.find("/Game/AudioMng").getComponent(AudioMng);

        this._bulletPool = new cc.NodePool();
        this._enemiesPool = new cc.NodePool();

        // 生成玩家
        this.spawnPlayer();
    }

    spawnNewEnemy() {
        if (this.enemies.childrenCount >= 6)
            return;

        if (this._remainEnemiesCount <= 0)
            return;

        if (this._remainEnemiesCount == Globals.ENEMIES_COUNT) {
            this.createEnemy(Globals.ENEMY1);
            this.createEnemy(Globals.ENEMY2);
            this.createEnemy(Globals.ENEMY3);
        } else if (this._remainEnemiesCount > 0) {
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

    spawnPlayer() {
        let player = cc.instantiate(this.player1);
        player.parent = this.players;
        player.getComponent(PlayerTank).init();
    }

    createEnemy(pos: cc.Vec2) {
        let enemy: cc.Node;

        if (this._enemiesPool.size() > 0) {
            enemy = this._enemiesPool.get();
        } else {
            enemy = cc.instantiate(this.enemy);
        }

        enemy.parent = this.enemies;
        enemy.getComponent(EnemyTank).init(new cc.Vec3(pos.x, pos.y));

        // 更新信息区域
        cc.find("/Canvas/GameLayer/Informations").getComponent(UpdateInformations).deleteOneIcon();

        this._remainEnemiesCount--;
    }

    toNextStage() {
        this._game.level = this._game.level + 1;
        this._game.gameStart();
    }

    _loadMap() {
        let self = this;

        cc.assetManager.loadBundle("maps", (err: Error, bundle: cc.AssetManager.Bundle) => {
            bundle.load(this._game.level.toString(), cc.TextAsset, function (err: Error, file: cc.TextAsset) {
                let data = file.text;
                let index = 0;

                for (let i = 0; i != 26; i++) {
                    for (let j = 0; j != 26; j++) {
                        let block: cc.Node;

                        switch (data[index++]) {
                            case '3':
                                block = cc.instantiate(self.blockWall);
                                block.name = "block_wall";
                                block.getComponent(BlockWall).init();
                                break;
                            case '5':
                                block = cc.instantiate(self.blockStone);
                                block.name = "block_stone";
                                break;
                            case '1':
                                block = cc.instantiate(self.blockForest);
                                break;
                            case '2':
                                block = cc.instantiate(self.blockIce);
                                break;
                            case '4':
                                block = cc.instantiate(self.blockRiver);
                                block.name = "block_river";
                                block.getComponent(cc.Animation).play("river");
                                break;
                            default:
                                break;
                        }

                        if (block) {
                            block.parent = self.blocks;
                            block.setAnchorPoint(0, 0);
                            block.setPosition(j * Globals.BLOCK_SIZE, (25 - i) * Globals.BLOCK_SIZE);
                        }
                    }
                }
            });
        });
    }

    _canSpawnTank(pos: cc.Vec2) {
        let box = new cc.Rect(
            pos.x - Globals.TANK_SIZE / 2,
            pos.y - Globals.TANK_SIZE / 2,
            Globals.TANK_SIZE,
            Globals.TANK_SIZE
        );

        let enemies = this.enemies.children;
        let players = this.players.children;

        for (const enemy of enemies) {
            if (box.intersects(enemy.getBoundingBox()))
                return false;
        }

        for (const player of players) {
            if (box.intersects(player.getBoundingBox()))
                return false;
        }

        return true;
    }

    _cleanChildNode() {
        for (const enemy of this.enemies.children) {
            enemy.getComponent(EnemyTank).onDestroyed();
        }

        for (const bullet of this.playerBullets.children) {
            bullet.getComponent(Bullet).onBulletDestory();
        }

        for (const bullet of this.enemiesBullets.children) {
            bullet.getComponent(Bullet).onBulletDestory();
        }

        for (const block of this.node.getChildByName("blocks").children) {
            if (block.name != "camp")
                block.destroy();
        }
    }

}
