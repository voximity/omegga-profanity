import OmeggaPlugin, { OL, PS, PC, OmeggaPlayer } from "omegga";

type Config = {
  badWords: string[];
  terribleWords: string[];
  terribleBanReason: string;
  warns: number;
  bans: number;
  tempBanLength: number;
  tempBanReason: string;
  exemptRoles: string[];
};
type Storage = { [uuid: string]: number };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async getInfractions(id: string): Promise<number> {
    return (await this.store.get(id)) ?? 0;
  }

  async addInfraction(id: string): Promise<number> {
    let val = (await this.store.get(id)) ?? 0;
    await this.store.set(id, ++val);
    return val;
  }

  async terribleInfraction(player: OmeggaPlayer): Promise<void> {
    this.omegga.writeln(
      `Chat.Command /Ban "${player.name}" -1 "${this.config.terribleBanReason}"`
    );
    await this.store.delete(player.id);

    console.log(
      `${player.name} (UUID ${player.id}) permanently banned for using a terribly bad word. Infraction count reset.`
    );
  }

  async infraction(player: OmeggaPlayer): Promise<void> {
    const infractions = await this.addInfraction(player.id);

    if (infractions <= this.config.warns) {
      let result;
      if (infractions === this.config.warns) {
        result = `The next infraction will result in a ${
          this.config.bans > 0 ? "temporary" : "permanent"
        } ban.`;
      } else {
        const count = this.config.warns - infractions;
        result = `You have ${count} warning${
          count !== 1 ? "s" : ""
        } left until a ban.`;
      }

      this.omegga.broadcast(
        `<b><color="ff0">${player.name}</>, that profanity is not allowed.</> ${result}`
      );

      console.log(
        `${player.name} (UUID ${player.id}) warned for using a bad word`
      );
    } else if (infractions <= this.config.warns + this.config.bans) {
      this.omegga.writeln(
        `Chat.Command /Ban "${player.name}" ${this.config.tempBanLength} "${this.config.tempBanReason}"`
      );

      console.log(
        `${player.name} (UUID ${player.id}) temporarily banned for using a bad word`
      );
    } else {
      this.omegga.writeln(
        `Chat.Command /Ban "${player.name}" -1 "Repeated use of profanity"`
      );
      await this.store.delete(player.id);

      console.log(
        `${player.name} (UUID ${player.id}) permanently banned for exceeding warns/temp ban count. Infraction count reset.`
      );
    }
  }

  async init() {
    this.config.terribleWords = this.config.terribleWords.map((s) =>
      s.toLowerCase()
    );
    this.config.badWords = this.config.badWords.map((s) => s.toLowerCase());

    this.omegga.on("chat", async (speaker, message) => {
      const player = this.omegga.getPlayer(speaker);
      if (player.isHost()) return; // the host is exempt always

      const roles = player.getRoles();
      if (
        this.config.exemptRoles.some((exempt) =>
          roles.find((role) => role.toLowerCase() === exempt.toLowerCase())
        )
      ) {
        return;
      }

      const lower = message.toLowerCase();
      for (const word of this.config.terribleWords) {
        if (lower.toLowerCase().includes(word)) {
          await this.terribleInfraction(player);
          return;
        }
      }

      for (const word of this.config.badWords) {
        if (lower.toLowerCase().includes(word)) {
          await this.infraction(player);
          return;
        }
      }
    });

    this.omegga.on("cmd:pardonprofanity", async (speaker, target) => {});
  }

  async stop() {}
}
