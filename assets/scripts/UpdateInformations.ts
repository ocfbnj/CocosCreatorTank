import { Globals } from "./Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateInformations extends cc.Component {
    @property(cc.Prefab)
    enemyIcon: cc.Prefab = null;

    enemyIcons: cc.Node[] = [];

    init() {
        for (const node of this.enemyIcons) {
            node.destroy();
        }

        this.enemyIcons = [];

        let x = -4;
        let y = 80;

        for (let i = 0; i != 10; i++) {
            for (let j = 0; j != 2; j++) {
                let node = cc.instantiate(this.enemyIcon);
                node.name = "icon";
                node.parent = this.node;

                node.x = x + j * 8;
                node.y = y - i * 8;

                this.enemyIcons.push(node);
            }
        }
    }

    deleteOneIcon() {
        this.enemyIcons.pop().destroy();
    }

    updatePlayerBlood(blood: number) {
        this.node.getChildByName("player_blood").getComponent(cc.Label).string = blood.toString();
    }

    updateCurrentLevel(level: number) {
        this.node.getChildByName("cur_level").getComponent(cc.Label).string = level.toString();
    }
}
