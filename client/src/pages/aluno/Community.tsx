import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  Trophy,
  TrendingUp,
  MoreVertical,
  Flag,
  Bookmark,
  Users,
  Flame,
  Target,
  Award,
  Camera,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    plan: string;
  };
  content: string;
  type: "text" | "image" | "video" | "achievement";
  media?: string[];
  achievement?: {
    type: "weight_loss" | "workout_streak" | "goal_reached" | "personal_record";
    title: string;
    description: string;
    icon: string;
  };
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags?: string[];
}

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export default function Community() {
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"text" | "image" | "video">("text");
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  // TODO: Replace with real data from API
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: "Carlos Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        plan: "Trimestral"
      },
      content: "Finalmente consegui perder 10kg! 🎉 Foram 4 meses de muito esforço, mas valeu cada gota de suor. Obrigado Douglas pelos treinos incríveis!",
      type: "achievement",
      achievement: {
        type: "weight_loss",
        title: "Perda de 10kg",
        description: "Meta alcançada em 4 meses",
        icon: "🏆"
      },
      media: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"],
      likes: 24,
      comments: [
        {
          id: 1,
          author: {
            name: "Ana Silva",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
          },
          content: "Parabéns! Você é uma inspiração! 💪",
          likes: 3,
          isLiked: false,
          createdAt: "2024-11-17T10:30:00"
        },
        {
          id: 2,
          author: {
            name: "Douglas Silva",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Douglas"
          },
          content: "Muito orgulhoso da sua dedicação! Continue assim! 🔥",
          likes: 8,
          isLiked: true,
          createdAt: "2024-11-17T11:00:00"
        }
      ],
      isLiked: true,
      isBookmarked: false,
      createdAt: "2024-11-17T09:00:00",
      tags: ["transformação", "perdadepeso", "motivação"]
    },
    {
      id: 2,
      author: {
        name: "Mariana Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
        plan: "Mensal"
      },
      content: "Treino de pernas hoje foi INSANO! 🔥 Quem mais treinou hoje?",
      type: "text",
      likes: 15,
      comments: [
        {
          id: 3,
          author: {
            name: "Pedro Santos",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
          },
          content: "Eu! Mal consigo andar agora 😅",
          likes: 2,
          isLiked: false,
          createdAt: "2024-11-17T15:30:00"
        }
      ],
      isLiked: false,
      isBookmarked: true,
      createdAt: "2024-11-17T14:00:00",
      tags: ["legday", "treino"]
    },
    {
      id: 3,
      author: {
        name: "Rafael Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael",
        plan: "Anual"
      },
      content: "30 dias de treino consecutivos! 🎯 A consistência é a chave do sucesso!",
      type: "achievement",
      achievement: {
        type: "workout_streak",
        title: "30 Dias Consecutivos",
        description: "Sequência de treinos mantida",
        icon: "🔥"
      },
      likes: 32,
      comments: [],
      isLiked: true,
      isBookmarked: false,
      createdAt: "2024-11-16T18:00:00",
      tags: ["consistência", "disciplina"]
    },
    {
      id: 4,
      author: {
        name: "Juliana Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
        plan: "Trimestral"
      },
      content: "Antes e depois de 3 meses! A transformação é real quando você se dedica 💪✨",
      type: "image",
      media: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600"
      ],
      likes: 45,
      comments: [
        {
          id: 4,
          author: {
            name: "Ana Silva",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
          },
          content: "Que evolução incrível! 😍",
          likes: 5,
          isLiked: true,
          createdAt: "2024-11-16T12:00:00"
        }
      ],
      isLiked: false,
      isBookmarked: true,
      createdAt: "2024-11-16T11:00:00",
      tags: ["transformação", "antesedepois"]
    }
  ]);

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmarkPost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    toast({
      title: posts.find(p => p.id === postId)?.isBookmarked ? "Removido dos salvos" : "Salvo com sucesso!",
      description: posts.find(p => p.id === postId)?.isBookmarked ? "" : "Você pode ver suas publicações salvas na aba Salvos",
    });
  };

  const handleAddComment = (postId: number) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: {
        name: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
      },
      content: commentText,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));

    setCommentText("");
    toast({
      title: "Comentário adicionado!",
      description: "Seu comentário foi publicado com sucesso.",
    });
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: {
        name: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        plan: "Trimestral"
      },
      content: newPostContent,
      type: newPostType,
      likes: 0,
      comments: [],
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      tags: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setShowCreatePost(false);
    toast({
      title: "Publicação criada!",
      description: "Sua publicação foi compartilhada com a comunidade.",
    });
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {post.author.plan}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Bookmark className="w-4 h-4 mr-2" />
              {post.isBookmarked ? "Remover dos salvos" : "Salvar"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Flag className="w-4 h-4 mr-2" />
              Denunciar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">{post.content}</p>

        {/* Achievement Badge */}
        {post.achievement && (
          <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{post.achievement.icon}</div>
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {post.achievement.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {post.achievement.description}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((url, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPost(post)}
              >
                <img 
                  src={url} 
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLikePost(post.id)}
            className={post.isLiked ? "text-red-500" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
            {post.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPost(post)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.comments.length}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBookmarkPost(post.id)}
          className={post.isBookmarked ? "text-primary" : ""}
        >
          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Quick Comment */}
      {post.comments.length > 0 && (
        <div className="pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPost(post)}
            className="text-muted-foreground"
          >
            Ver todos os {post.comments.length} comentários
          </Button>
        </div>
      )}
    </Card>
  );

  const savedPosts = posts.filter(p => p.isBookmarked);
  const trendingTags = ["transformação", "motivação", "legday", "perdadepeso", "antesedepois"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Comunidade
          </h1>
          <p className="text-muted-foreground">Compartilhe sua jornada e inspire outros alunos</p>
        </div>
        <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-post">
          <Send className="w-4 h-4 mr-2" />
          Nova Publicação
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">
                <Flame className="w-4 h-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-2" />
                Em Alta
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="w-4 h-4 mr-2" />
                Salvos ({savedPosts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4 mt-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>

            <TabsContent value="trending" className="space-y-4 mt-6">
              {posts.filter(p => p.likes > 20).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4 mt-6">
              {savedPosts.length > 0 ? (
                savedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma publicação salva</h3>
                  <p className="text-muted-foreground">
                    Salve publicações interessantes para ver depois
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Estatísticas da Comunidade
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Membros Ativos</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Publicações Hoje</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Metas Alcançadas</span>
                <span className="font-semibold">45</span>
              </div>
            </div>
          </Card>

          {/* Trending Tags */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Tags em Alta
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Top Contributors */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Destaques do Mês
            </h3>
            <div className="space-y-3">
              {[
                { name: "Carlos Silva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", posts: 15 },
                { name: "Juliana Mendes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana", posts: 12 },
                { name: "Rafael Oliveira", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael", posts: 10 }
              ].map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.posts} posts
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Publicação</DialogTitle>
            <DialogDescription>
              Compartilhe sua jornada, conquistas ou dicas com a comunidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Ana Silva</p>
                <Badge variant="secondary" className="text-xs">Trimestral</Badge>
              </div>
            </div>

            <Textarea
              placeholder="O que você quer compartilhar?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={6}
              className="resize-none"
            />

            <div className="flex gap-2">
              <Button
                variant={newPostType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setNewPostType("image")}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Foto
              </Button>
              <Button
                variant={newPostType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setNewPostType("video")}
              >
                <Video className="w-4 h-4 mr-2" />
                Vídeo
              </Button>
              <Button variant="outline" size="sm">
                <Trophy className="w-4 h-4 mr-2" />
                Conquista
              </Button>
            </div>

            {newPostType !== "text" && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar {newPostType === "image" ? "fotos" : "vídeo"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePost(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Details Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-6">
              {/* Post Header */}
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedPost.author.avatar} />
                  <AvatarFallback>{selectedPost.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPost.author.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <p>{selectedPost.content}</p>
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="grid gap-2">
                    {selectedPost.media.map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Media ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Comentários ({selectedPost.comments.length})</h4>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedPost.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="font-medium text-sm">{comment.author.name}</p>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {comment.likes > 0 && comment.likes}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2 pt-4 border-t">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Adicione um comentário..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleAddComment(selectedPost.id)}
                      disabled={!commentText.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
