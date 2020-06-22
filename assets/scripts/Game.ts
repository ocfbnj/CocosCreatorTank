const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property({ type: cc.AudioClip })
    binAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    shootAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    playerMoveAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    tankBombAudio: cc.AudioClip = null;

    @property(cc.Integer)
    level: number = 1;

    enableAudio: boolean;
    playerMoveID: number;

    onLoad() {
        this.enableAudio = true;
    }

    playAudio(name: string, loop = false) {
        if (!this.enableAudio) return;

        if (name == "bin") {
            cc.audioEngine.playEffect(this.binAudio, loop);
        } else if (name == "shoot") {
            cc.audioEngine.playEffect(this.shootAudio, loop);
        } else if (name == "player_move") {
            this.playerMoveID = cc.audioEngine.playEffect(this.playerMoveAudio, loop);
            cc.audioEngine.setVolume(this.playerMoveID, 0.8);
        } else if (name == "tank_bomb") {
            cc.audioEngine.playEffect(this.tankBombAudio, loop);
        }
    }

    stopAudio(name: string) {
        if (!this.enableAudio) return;

        if (name == "player_move") {
            cc.audioEngine.stop(this.playerMoveID);
        }
    }
}
