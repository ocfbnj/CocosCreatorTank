import { Globals } from "../Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateInformations extends cc.Component {
    @property(cc.Prefab)
    enemyIcon: cc.Prefab = null;
    @property(cc.Node)
    enemiesIcon: cc.Node = null;

    deleteOneIcon() {
        this.enemiesIcon.children[this.enemiesIcon.childrenCount - 1].destroy();
    }

    updatePlayerBlood(blood: number) {
        this.node.getChildByName("player_blood").getComponent(cc.Label).string = blood.toString();
    }

    init(level: number) {
        // 清理子节点
        this.enemiesIcon.removeAllChildren(true);

        const column = 2;
        const row = Globals.ENEMIES_COUNT / column;

        // 添加坦克图标
        for (let i = 0; i != row - 1; i++) {
            for (let j = 0; j != column; j++) {
                let node = cc.instantiate(this.enemyIcon);
                node.name = "icon";
                node.parent = this.enemiesIcon;
            }
        }

        this.node.getChildByName("cur_level").getComponent(cc.Label).string = level.toString();
    }
}
