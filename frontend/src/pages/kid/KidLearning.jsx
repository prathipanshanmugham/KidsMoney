import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, CheckCircle, Star, ArrowRight, Award } from 'lucide-react';
import { toast } from 'sonner';

const CAT_COLORS = { basics: '#4F7DF3', saving: '#34D399', spending: '#F472B6', interest: '#A78BFA', loans: '#FB923C' };

export default function KidLearning() {
  const [stories, setStories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [s, p] = await Promise.all([API.get('/kid/learning/stories'), API.get('/kid/learning/progress')]);
      setStories(s.data); setProgress(p.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const isCompleted = (id) => progress.some(p => p.story_id === id);
  const getScore = (id) => progress.find(p => p.story_id === id)?.score || 0;

  const submitQuiz = async () => {
    let score = 0;
    activeStory.questions.forEach((q, i) => { if (answers[i] === q.correct) score++; });
    try {
      const { data } = await API.post('/kid/learning/complete', { story_id: activeStory.id, score });
      setQuizResult({ score, total: activeStory.questions.length, xp: data.xp_earned || 0, done: data.already_completed });
      load();
    } catch (err) { toast.error('Failed to submit'); }
  };

  const close = () => { setActiveStory(null); setQuizMode(false); setAnswers({}); setQuizResult(null); };

  const completedCount = progress.length;

  return (
    <div className="animate-fade-in" data-testid="kid-learning-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Stories</h1>
      <p className="text-muted-foreground text-sm mb-8">Learn about money through fun stories!</p>

      <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm mb-8`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.primary + '15' }}>
                <BookOpen className="w-5 h-5" style={{ color: t.primary }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Progress</p>
                <p className="text-xs text-muted-foreground">{completedCount} / {stories.length} stories</p>
              </div>
            </div>
            <Badge className={`rounded-full border-0 ${t.badge}`}>{Math.round((completedCount / Math.max(stories.length, 1)) * 100)}%</Badge>
          </div>
          <Progress value={(completedCount / Math.max(stories.length, 1)) * 100} className="h-2 rounded-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map(story => {
          const done = isCompleted(story.id);
          return (
            <Card key={story.id} className={`rounded-3xl border ${t.cardBorder} shadow-sm cursor-pointer card-hover`} onClick={() => setActiveStory(story)} data-testid={`kid-story-${story.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: (CAT_COLORS[story.category] || t.primary) + '15' }}>
                    <BookOpen className="w-5 h-5" style={{ color: CAT_COLORS[story.category] || t.primary }} />
                  </div>
                  {done && <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-[10px] text-green-500 font-medium">{getScore(story.id)}/3</span></div>}
                </div>
                <h4 className="font-semibold font-heading mb-1">{story.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{story.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="rounded-full text-[10px]">{story.category}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3" /> +{story.reward_xp} XP</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!activeStory} onOpenChange={v => { if (!v) close(); }}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto">
          {activeStory && !quizMode && !quizResult && (
            <>
              <DialogHeader>
                <Badge className="w-fit rounded-full text-[10px] mb-2" style={{ backgroundColor: (CAT_COLORS[activeStory.category] || t.primary) + '15', color: CAT_COLORS[activeStory.category] || t.primary }}>{activeStory.category}</Badge>
                <DialogTitle className="font-heading text-2xl">{activeStory.title}</DialogTitle>
                <DialogDescription>{activeStory.description}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 whitespace-pre-line">{activeStory.content}</p>
              <Button className="w-full rounded-full h-12 font-semibold mt-6" style={{ backgroundColor: t.primary }} onClick={() => { setQuizMode(true); setAnswers({}); }} data-testid="kid-start-quiz">
                Take the Quiz <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
          {activeStory && quizMode && !quizResult && (
            <>
              <DialogHeader><DialogTitle className="font-heading text-xl">Quiz Time!</DialogTitle><DialogDescription>Answer the questions</DialogDescription></DialogHeader>
              <div className="space-y-6 mt-4">
                {activeStory.questions.map((q, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => setAnswers({...answers, [qi]: oi})}
                          className={`w-full text-left p-3 rounded-xl text-sm transition-all ${answers[qi] === oi ? 'text-white' : 'bg-muted/50 hover:bg-muted'}`}
                          style={answers[qi] === oi ? { backgroundColor: t.primary } : {}}
                          data-testid={`kid-quiz-${qi}-${oi}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="w-full rounded-full h-12 font-semibold" style={{ backgroundColor: t.primary }}
                  disabled={Object.keys(answers).length < activeStory.questions.length} onClick={submitQuiz} data-testid="kid-submit-quiz">
                  Submit
                </Button>
              </div>
            </>
          )}
          {quizResult && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: t.primary + '15' }}>
                <Award className="w-8 h-8" style={{ color: t.primary }} />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2">{quizResult.score === quizResult.total ? 'Perfect!' : quizResult.score >= 2 ? 'Great!' : 'Keep learning!'}</h3>
              <p className="text-muted-foreground text-sm mb-4">{quizResult.score} / {quizResult.total} correct</p>
              {!quizResult.done && quizResult.xp > 0 && <Badge className={`rounded-full border-0 text-sm mb-4 ${t.badge}`}>+{quizResult.xp} XP!</Badge>}
              <br /><Button className="rounded-full px-8 mt-2" style={{ backgroundColor: t.primary }} onClick={close} data-testid="kid-close-quiz">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
