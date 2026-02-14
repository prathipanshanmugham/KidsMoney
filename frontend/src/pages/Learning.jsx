import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, CheckCircle, Star, ArrowRight, Award } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  basics: '#4F7DF3',
  saving: '#34D399',
  spending: '#F472B6',
  interest: '#A78BFA',
  loans: '#FB923C',
};

export default function Learning() {
  const { selectedKid } = useAuth();
  const [stories, setStories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => { if (selectedKid) loadData(); }, [selectedKid]);

  const loadData = async () => {
    try {
      const [storiesRes, progressRes] = await Promise.all([
        API.get('/learning/stories'),
        API.get(`/learning/progress/${selectedKid.id}`)
      ]);
      setStories(storiesRes.data);
      setProgress(progressRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const isCompleted = (storyId) => progress.some(p => p.story_id === storyId);
  const getScore = (storyId) => progress.find(p => p.story_id === storyId)?.score || 0;

  const handleStartQuiz = () => {
    setQuizMode(true);
    setAnswers({});
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    const story = activeStory;
    let score = 0;
    story.questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    try {
      const { data } = await API.post('/learning/complete', { kid_id: selectedKid.id, story_id: story.id, score });
      setQuizResult({ score, total: story.questions.length, xp: data.xp_earned || 0, alreadyDone: data.already_completed });
      loadData();
    } catch (err) { toast.error('Failed to submit quiz'); }
  };

  const closeStory = () => {
    setActiveStory(null);
    setQuizMode(false);
    setAnswers({});
    setQuizResult(null);
  };

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  const completedCount = progress.length;
  const totalStories = stories.length;

  return (
    <div className="animate-fade-in" data-testid="learning-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Learn</h1>
        <p className="text-muted-foreground text-sm">Financial stories for {selectedKid.name}</p>
      </div>

      {/* Progress Overview */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Learning Progress</p>
                <p className="text-xs text-muted-foreground">{completedCount} of {totalStories} stories completed</p>
              </div>
            </div>
            <Badge className="rounded-full bg-orange-500/10 text-orange-600 border-0">{Math.round((completedCount / Math.max(totalStories, 1)) * 100)}%</Badge>
          </div>
          <Progress value={(completedCount / Math.max(totalStories, 1)) * 100} className="h-2 rounded-full" />
        </CardContent>
      </Card>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-muted rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => {
            const done = isCompleted(story.id);
            const catColor = CATEGORY_COLORS[story.category] || '#4F7DF3';
            return (
              <Card
                key={story.id}
                className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 cursor-pointer card-hover"
                onClick={() => setActiveStory(story)}
                data-testid={`story-card-${story.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: catColor + '15' }}>
                      <BookOpen className="w-5 h-5" style={{ color: catColor }} />
                    </div>
                    {done && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-[10px] text-secondary font-medium">{getScore(story.id)}/3</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold font-heading mb-1">{story.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{story.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="rounded-full text-[10px]">{story.category}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> +{story.reward_xp} XP
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Story Dialog */}
      <Dialog open={!!activeStory} onOpenChange={(v) => { if (!v) closeStory(); }}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto">
          {activeStory && !quizMode && !quizResult && (
            <>
              <DialogHeader>
                <Badge className="w-fit rounded-full text-[10px] mb-2" style={{ backgroundColor: (CATEGORY_COLORS[activeStory.category] || '#4F7DF3') + '15', color: CATEGORY_COLORS[activeStory.category] }}>
                  {activeStory.category}
                </Badge>
                <DialogTitle className="font-heading text-2xl">{activeStory.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">{activeStory.description}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 whitespace-pre-line">{activeStory.content}</p>
              <Button className="w-full rounded-full h-12 font-semibold mt-6" onClick={handleStartQuiz} data-testid="start-quiz-btn">
                Take the Quiz <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {activeStory && quizMode && !quizResult && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Quiz Time!</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Answer the questions below</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {activeStory.questions.map((q, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setAnswers({...answers, [qi]: oi})}
                          className={`w-full text-left p-3 rounded-xl text-sm transition-all ${answers[qi] === oi ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}
                          data-testid={`quiz-option-${qi}-${oi}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full rounded-full h-12 font-semibold"
                  disabled={Object.keys(answers).length < activeStory.questions.length}
                  onClick={handleSubmitQuiz}
                  data-testid="submit-quiz-btn"
                >
                  Submit Answers
                </Button>
              </div>
            </>
          )}

          {quizResult && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2">
                {quizResult.score === quizResult.total ? 'Perfect!' : quizResult.score >= 2 ? 'Great job!' : 'Keep learning!'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                You got {quizResult.score} out of {quizResult.total} correct
              </p>
              {!quizResult.alreadyDone && quizResult.xp > 0 && (
                <Badge className="rounded-full bg-secondary/10 text-secondary border-0 text-sm mb-4">+{quizResult.xp} XP earned!</Badge>
              )}
              {quizResult.alreadyDone && (
                <p className="text-xs text-muted-foreground mb-4">Story already completed - no extra XP</p>
              )}
              <Button className="rounded-full px-8" onClick={closeStory} data-testid="close-quiz-btn">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
