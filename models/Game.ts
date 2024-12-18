import mongoose, { Schema, Document } from "mongoose";

interface IFrame {
  lancers: number[];
  scoreFrame: number;
  isFrame: boolean;
  isSpare: boolean;
}

export interface IGame extends Document {
  playerName: string;
  frames: IFrame[];
  scoreTotal: number;
  date: Date;
}

const FrameSchema = new Schema({
  lancers: [Number],
  scoreFrame: Number,
  isFrame: Boolean,
  isSpare: Boolean,
});

const GameSchema = new Schema({
  playerName: { type: String, required: true },
  frames: [
    {
      lancers: {
        type: [Number],
        validate: {
          validator: function (lancers: number[]) {
            return lancers.every((quilles) => quilles >= 0 && quilles <= 15);
          },
          message: "Chaque lancer doit abattre entre 0 et 15 quilles",
        },
      },
      scoreFrame: Number,
      isFrame: Boolean,
      isSpare: Boolean,
    },
  ],
  scoreTotal: {
    type: Number,
    default: 0,
    max: 300,
  },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IGame>("Game", GameSchema);
