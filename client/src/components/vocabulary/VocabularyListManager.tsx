import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Edit, Plus, Book, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VocabularyList {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  languageId: number;
  createdAt: string;
  updatedAt: string;
  icon: string | null;
  color: string | null;
}

interface VocabularyListWord {
  word: {
    id: number;
    userId: number;
    word: string;
    translation: string;
    languageId: number;
    learnedAt: string;
  };
  metadata: {
    id: number;
    listId: number;
    wordId: number;
    addedAt: string;
    notes: string | null;
  };
}

const PREDEFINED_COLORS = [
  '#8F87F1', // Primary purple
  '#C68EFD', // Secondary purple
  '#E9A5F1', // Pink
  '#FED2E2', // Light pink
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F43F5E', // Rose
];

export default function VocabularyListManager() {
  const { userId, selectedLanguage } = useApp();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'book',
    color: '#8F87F1',
    languageId: selectedLanguage?.id || 1,
  });

  // Define the response types
  interface VocabularyListsResponse {
    vocabularyLists: VocabularyList[];
  }
  
  interface VocabularyListWordsResponse {
    words: VocabularyListWord[];
  }

  // Fetch vocabulary lists
  const { data: listsData, isLoading: isLoadingLists } = useQuery<VocabularyListsResponse>({
    queryKey: ['/api/users', userId, 'vocabulary-lists'],
    enabled: !!userId,
  });

  // Fetch words for selected list
  const { data: listWordsData, isLoading: isLoadingWords } = useQuery<VocabularyListWordsResponse>({
    queryKey: ['/api/vocabulary-lists', selectedListId, 'words'],
    enabled: !!selectedListId,
  });

  // Create vocabulary list mutation
  const createListMutation = useMutation({
    mutationFn: (newList: Omit<typeof formData, 'languageId'> & { languageId: number }) => 
      apiRequest('POST', `/api/users/${userId}/vocabulary-lists`, newList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'vocabulary-lists'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success!',
        description: 'Vocabulary list created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create vocabulary list. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete vocabulary list mutation
  const deleteListMutation = useMutation({
    mutationFn: (listId: number) => 
      apiRequest('DELETE', `/api/vocabulary-lists/${listId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'vocabulary-lists'] });
      toast({
        title: 'Success!',
        description: 'Vocabulary list deleted successfully.',
      });
      if (selectedListId) {
        setSelectedListId(null);
        setIsViewDialogOpen(false);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete vocabulary list. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Add word to list mutation
  const addWordToListMutation = useMutation({
    mutationFn: ({ listId, wordId }: { listId: number; wordId: number }) => 
      apiRequest('POST', `/api/vocabulary-lists/${listId}/words`, { wordId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary-lists', selectedListId, 'words'] });
      toast({
        title: 'Success!',
        description: 'Word added to vocabulary list.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add word to vocabulary list. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove word from list mutation
  const removeWordFromListMutation = useMutation({
    mutationFn: ({ listId, wordId }: { listId: number; wordId: number }) => 
      apiRequest('DELETE', `/api/vocabulary-lists/${listId}/words/${wordId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary-lists', selectedListId, 'words'] });
      toast({
        title: 'Success!',
        description: 'Word removed from vocabulary list.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove word from vocabulary list. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'book',
      color: '#8F87F1',
      languageId: selectedLanguage?.id || 1,
    });
  };

  // Handle form submission
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    createListMutation.mutate({
      ...formData,
      languageId: selectedLanguage?.id || 1,
    });
  };

  // Handle view list
  const handleViewList = (listId: number) => {
    setSelectedListId(listId);
    setIsViewDialogOpen(true);
  };

  // Handle delete list
  const handleDeleteList = (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this vocabulary list?')) {
      deleteListMutation.mutate(listId);
    }
  };

  const vocabularyLists: VocabularyList[] = listsData?.vocabularyLists || [];
  const listWords: VocabularyListWord[] = listWordsData?.words || [];
  const selectedList = vocabularyLists.find(list => list.id === selectedListId);

  // Update form language when selected language changes
  useEffect(() => {
    if (selectedLanguage) {
      setFormData(prev => ({
        ...prev,
        languageId: selectedLanguage.id,
      }));
    }
  }, [selectedLanguage]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Vocabulary Lists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vocabulary List</DialogTitle>
              <DialogDescription>
                Organize your learned words into custom vocabulary lists.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Favorite Words"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A collection of words I want to remember"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-black' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="bookmark">Bookmark</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="star">Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createListMutation.isPending}>
                  {createListMutation.isPending ? 'Creating...' : 'Create List'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingLists ? (
        <p>Loading your vocabulary lists...</p>
      ) : vocabularyLists.length === 0 ? (
        <div className="text-center py-8">
          <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No vocabulary lists yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first list to organize your learned words.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First List
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vocabularyLists.map((list) => (
            <Card 
              key={list.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewList(list.id)}
            >
              <CardHeader style={{ backgroundColor: list.color || '#8F87F1' }} className="text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg truncate">{list.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => handleDeleteList(list.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-white/80 truncate">
                  {list.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">
                  {`Language: ${
                    selectedLanguage?.id === list.languageId
                      ? selectedLanguage.name
                      : 'Other'
                  }`}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleViewList(list.id)}>
                  View Words
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* View List Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedList && (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: selectedList.color || '#8F87F1' }}>
                  {selectedList.name}
                </DialogTitle>
                <DialogDescription>{selectedList.description}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <h3 className="text-lg font-medium mb-4">Words in this list</h3>
                {isLoadingWords ? (
                  <p>Loading words...</p>
                ) : listWords.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No words in this list yet. Add words by marking them as learned while using the AR view.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listWords.map(({ word, metadata }) => (
                      <div
                        key={metadata.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{word.word}</p>
                          <p className="text-sm text-gray-500">{word.translation}</p>
                          {metadata.notes && (
                            <p className="text-xs italic mt-1">Note: {metadata.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeWordFromListMutation.mutate({
                              listId: selectedList.id,
                              wordId: word.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => deleteListMutation.mutate(selectedList.id)}
                >
                  Delete List
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}