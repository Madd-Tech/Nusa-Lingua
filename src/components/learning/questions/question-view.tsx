"use client";

import { AlertTriangle, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/learning/audio-button";
import { QUESTION_TYPE_LABEL, getChoices, getPairs, primaryAnswer } from "@/lib/questions";
import type { QuestionProps } from "./types";
import { ChoiceQuestion } from "./choice-question";
import { TextQuestion } from "./text-question";
import { ArrangeQuestion } from "./arrange-question";
import { MatchQuestion } from "./match-question";
import { SpeakQuestion } from "./speak-question";

export function QuestionView(props: QuestionProps & { onSkip: () => void }) {
  const { question, onSkip } = props;
  const audioSrc = question.audio_url ?? question.vocabulary?.audio_url ?? null;
  const hasChoices = getChoices(question.options).length > 1;
  // Suara cadangan (TTS) harus mengucapkan kata bahasa daerahnya, bukan jawaban berbahasa Indonesia.
  const listenText = question.vocabulary?.word ?? primaryAnswer(question.correct_answer);

  let body: React.ReactNode;
  switch (question.type) {
    case "multiple_choice":
      body = hasChoices ? <ChoiceQuestion {...props} /> : <TextQuestion {...props} />;
      break;
    case "translate":
      body = (
        <TextQuestion
          {...props}
          placeholder="Tulis terjemahannya…"
          wordBank={hasChoices ? getChoices(question.options) : undefined}
        />
      );
      break;
    case "listen":
      body = (
        <div className="space-y-6">
          <div className="flex items-end justify-center gap-4">
            <AudioButton
              src={audioSrc}
              fallbackText={listenText}
              label="Putar audio soal"
              size="lg"
              autoPlay
            />
            <div className="flex flex-col items-center gap-1">
              <AudioButton
                src={audioSrc}
                fallbackText={listenText}
                label="Putar audio pelan (0,75x)"
                size="md"
                rate={0.75}
                icon={Snail}
              />
              <span aria-hidden="true" className="text-xs font-bold text-muted-foreground">
                0,75x
              </span>
            </div>
          </div>
          {hasChoices ? <ChoiceQuestion {...props} /> : <TextQuestion {...props} placeholder="Tulis apa yang kamu dengar…" />}
        </div>
      );
      break;
    case "arrange":
      body = <ArrangeQuestion {...props} />;
      break;
    case "match":
      body =
        getPairs(question.options, question.correct_answer).length > 0 ? (
          <MatchQuestion {...props} />
        ) : (
          <MalformedQuestion onSkip={onSkip} />
        );
      break;
    case "speak":
      body = <SpeakQuestion {...props} onSkip={onSkip} />;
      break;
    default:
      body = <MalformedQuestion onSkip={onSkip} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-primary-700 dark:text-primary">
          {QUESTION_TYPE_LABEL[question.type] ?? "Soal"}
        </p>
        <div className="flex items-start gap-3">
          {audioSrc && question.type !== "listen" && question.type !== "speak" ? (
            <AudioButton src={audioSrc} label="Putar audio" size="sm" className="mt-1" />
          ) : null}
          <h1 id="soal" className="text-2xl leading-snug sm:text-3xl">
            {question.prompt}
          </h1>
        </div>
        {question.vocabulary?.pronunciation && question.type !== "listen" ? (
          <p className="text-sm text-muted-foreground">Pelafalan: /{question.vocabulary.pronunciation}/</p>
        ) : null}
      </div>
      {body}
    </div>
  );
}

function MalformedQuestion({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center">
      <AlertTriangle aria-hidden="true" className="size-8 text-accent" />
      <p className="text-sm text-muted-foreground">Soal ini belum bisa ditampilkan dengan benar. Lewati saja — tidak mengurangi nyawa.</p>
      <Button variant="outline" onClick={onSkip}>
        Lewati soal
      </Button>
    </div>
  );
}
