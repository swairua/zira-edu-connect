import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { useLibraryBooks, useLibraryBookCopies, LibraryBook, LibraryBookCopy } from '@/hooks/useLibraryBooks';
import { Plus, Search, Edit, Trash2, BookCopy, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function BookCatalog() {
  const { books, isLoading, createBook, updateBook, deleteBook } = useLibraryBooks();
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<LibraryBook | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  
  // Copy management state
  const [isAddCopyOpen, setIsAddCopyOpen] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState<LibraryBook | null>(null);
  const [editCopy, setEditCopy] = useState<LibraryBookCopy | null>(null);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publication_year: '',
    location: '',
    description: '',
  });

  const [copyFormData, setCopyFormData] = useState({
    copy_number: '',
    barcode: '',
    condition: 'good' as 'good' | 'fair' | 'damaged' | 'lost',
    acquisition_date: '',
    notes: '',
  });

  const [bulkAddData, setBulkAddData] = useState({
    prefix: '',
    startNumber: 1,
    count: 1,
    condition: 'good' as 'good' | 'fair' | 'damaged' | 'lost',
  });

  const canEdit = can('library', 'edit');
  const canDelete = can('library', 'delete');
  const canCreate = can('library', 'create');

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (editBook) {
      await updateBook.mutateAsync({
        id: editBook.id,
        ...formData,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      });
      setEditBook(null);
    } else {
      await createBook.mutateAsync({
        ...formData,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      });
      setIsAddOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publication_year: '',
      location: '',
      description: '',
    });
  };

  const openEdit = (book: LibraryBook) => {
    setEditBook(book);
    setFormData({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year?.toString() || '',
      location: book.location || '',
      description: book.description || '',
    });
  };

  const openAddCopy = (book: LibraryBook) => {
    setSelectedBookForCopy(book);
    setCopyFormData({
      copy_number: '',
      barcode: '',
      condition: 'good',
      acquisition_date: '',
      notes: '',
    });
    setIsAddCopyOpen(true);
  };

  const openBulkAdd = (book: LibraryBook) => {
    setSelectedBookForCopy(book);
    setBulkAddData({
      prefix: book.title.substring(0, 3).toUpperCase() + '-',
      startNumber: book.total_copies + 1,
      count: 1,
      condition: 'good',
    });
    setIsBulkAddOpen(true);
  };

  const openEditCopy = (copy: LibraryBookCopy) => {
    setEditCopy(copy);
    setCopyFormData({
      copy_number: copy.copy_number,
      barcode: copy.barcode || '',
      condition: copy.condition,
      acquisition_date: copy.acquisition_date || '',
      notes: copy.notes || '',
    });
  };

  const bookFormFields = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Book title"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="Author name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
            placeholder="ISBN"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Fiction, Science"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
            placeholder="Publisher name"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="year">Publication Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.publication_year}
            onChange={(e) => setFormData(prev => ({ ...prev, publication_year: e.target.value }))}
            placeholder="e.g., 2023"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Shelf Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., A-12"
          />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Book Catalog">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Book Catalog</h1>
            <p className="text-muted-foreground">Manage your library's book collection and copies</p>
          </div>
          {canCreate && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book Title
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Book Title</DialogTitle>
                  <DialogDescription>Add a new book title to your library catalog</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  {bookFormFields}
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.title || createBook.isPending}>
                    {createBook.isPending ? 'Adding...' : 'Add Book'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Books</CardTitle>
                <CardDescription>{books.length} book titles in catalog</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookCopy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'No books match your search' : 'No books in catalog yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBooks.map((book) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    isExpanded={expandedBookId === book.id}
                    onToggle={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
                    onEdit={() => openEdit(book)}
                    onDelete={() => deleteBook.mutate(book.id)}
                    onAddCopy={() => openAddCopy(book)}
                    onBulkAdd={() => openBulkAdd(book)}
                    onEditCopy={openEditCopy}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canCreate={canCreate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Book Dialog */}
        <Dialog open={!!editBook} onOpenChange={() => setEditBook(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription>Update book information</DialogDescription>
            </DialogHeader>
            <DialogBody>
              {bookFormFields}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditBook(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title || updateBook.isPending}>
                {updateBook.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Copy Dialog */}
        <AddCopyDialog
          book={selectedBookForCopy}
          isOpen={isAddCopyOpen}
          onClose={() => {
            setIsAddCopyOpen(false);
            setSelectedBookForCopy(null);
          }}
          formData={copyFormData}
          setFormData={setCopyFormData}
        />

        {/* Edit Copy Dialog */}
        <EditCopyDialog
          copy={editCopy}
          onClose={() => setEditCopy(null)}
          formData={copyFormData}
          setFormData={setCopyFormData}
        />

        {/* Bulk Add Dialog */}
        <BulkAddDialog
          book={selectedBookForCopy}
          isOpen={isBulkAddOpen}
          onClose={() => {
            setIsBulkAddOpen(false);
            setSelectedBookForCopy(null);
          }}
          formData={bulkAddData}
          setFormData={setBulkAddData}
        />
      </div>
    </DashboardLayout>
  );
}

// Expandable Book Row Component
function BookRow({
  book,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddCopy,
  onBulkAdd,
  onEditCopy,
  canEdit,
  canDelete,
  canCreate,
}: {
  book: LibraryBook;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCopy: () => void;
  onBulkAdd: () => void;
  onEditCopy: (copy: LibraryBookCopy) => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-muted-foreground">
                  {book.author || 'Unknown author'} {book.category && `• ${book.category}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{book.total_copies} copies</p>
                <Badge variant={book.available_copies > 0 ? 'default' : 'secondary'}>
                  {book.available_copies} available
                </Badge>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="ghost" size="icon" onClick={onDelete}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CopiesSection
            bookId={book.id}
            onAddCopy={onAddCopy}
            onBulkAdd={onBulkAdd}
            onEditCopy={onEditCopy}
            canCreate={canCreate}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Copies Section Component
function CopiesSection({
  bookId,
  onAddCopy,
  onBulkAdd,
  onEditCopy,
  canCreate,
  canEdit,
  canDelete,
}: {
  bookId: string;
  onAddCopy: () => void;
  onBulkAdd: () => void;
  onEditCopy: (copy: LibraryBookCopy) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const { copies, isLoading, deleteCopy } = useLibraryBookCopies(bookId);

  return (
    <div className="border-t bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Book Copies ({copies.length})
        </h4>
        {canCreate && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBulkAdd}>
              <Plus className="h-3 w-3 mr-1" />
              Bulk Add
            </Button>
            <Button size="sm" onClick={onAddCopy}>
              <Plus className="h-3 w-3 mr-1" />
              Add Copy
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : copies.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No copies added yet</p>
          {canCreate && (
            <Button variant="link" size="sm" onClick={onAddCopy}>
              Add your first copy
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Copy Number</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acquired</TableHead>
                {(canEdit || canDelete) && <TableHead className="w-[80px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {copies.map((copy) => (
                <TableRow key={copy.id}>
                  <TableCell className="font-medium">{copy.copy_number}</TableCell>
                  <TableCell>{copy.barcode || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      copy.condition === 'good' ? 'default' :
                      copy.condition === 'fair' ? 'secondary' :
                      'destructive'
                    }>
                      {copy.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={copy.is_available ? 'outline' : 'secondary'}>
                      {copy.is_available ? 'Available' : 'On Loan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {copy.acquisition_date || '-'}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditCopy(copy)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {canDelete && copy.is_available && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteCopy.mutate({ id: copy.id, bookId })}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}

// Add Copy Dialog Component
function AddCopyDialog({
  book,
  isOpen,
  onClose,
  formData,
  setFormData,
}: {
  book: LibraryBook | null;
  isOpen: boolean;
  onClose: () => void;
  formData: { copy_number: string; barcode: string; condition: 'good' | 'fair' | 'damaged' | 'lost'; acquisition_date: string; notes: string };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
}) {
  const { createCopy } = useLibraryBookCopies(book?.id);

  const handleSubmit = async () => {
    if (!book) return;
    await createCopy.mutateAsync({
      book_id: book.id,
      copy_number: formData.copy_number,
      condition: formData.condition,
      barcode: formData.barcode || undefined,
      acquisition_date: formData.acquisition_date || undefined,
      notes: formData.notes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Copy</DialogTitle>
          <DialogDescription>Add a new copy of "{book?.title}"</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Copy Number *</Label>
              <Input
                value={formData.copy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, copy_number: e.target.value }))}
                placeholder="e.g., MATH-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Barcode</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Barcode"
                />
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, condition: val as 'good' | 'fair' | 'damaged' | 'lost' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Acquisition Date</Label>
              <Input
                type="date"
                value={formData.acquisition_date}
                onChange={(e) => setFormData(prev => ({ ...prev, acquisition_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.copy_number || createCopy.isPending}>
            {createCopy.isPending ? 'Adding...' : 'Add Copy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Copy Dialog Component
function EditCopyDialog({
  copy,
  onClose,
  formData,
  setFormData,
}: {
  copy: LibraryBookCopy | null;
  onClose: () => void;
  formData: { copy_number: string; barcode: string; condition: 'good' | 'fair' | 'damaged' | 'lost'; acquisition_date: string; notes: string };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
}) {
  const { updateCopy } = useLibraryBookCopies(copy?.book_id);

  const handleSubmit = async () => {
    if (!copy) return;
    await updateCopy.mutateAsync({
      id: copy.id,
      copy_number: formData.copy_number,
      condition: formData.condition,
      barcode: formData.barcode || null,
      acquisition_date: formData.acquisition_date || null,
      notes: formData.notes || null,
    });
    onClose();
  };

  return (
    <Dialog open={!!copy} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Copy</DialogTitle>
          <DialogDescription>Update copy information</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Copy Number *</Label>
              <Input
                value={formData.copy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, copy_number: e.target.value }))}
                placeholder="e.g., MATH-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Barcode</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Barcode"
                />
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, condition: val as 'good' | 'fair' | 'damaged' | 'lost' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Acquisition Date</Label>
              <Input
                type="date"
                value={formData.acquisition_date}
                onChange={(e) => setFormData(prev => ({ ...prev, acquisition_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.copy_number || updateCopy.isPending}>
            {updateCopy.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Add Dialog Component
function BulkAddDialog({
  book,
  isOpen,
  onClose,
  formData,
  setFormData,
}: {
  book: LibraryBook | null;
  isOpen: boolean;
  onClose: () => void;
  formData: { prefix: string; startNumber: number; count: number; condition: 'good' | 'fair' | 'damaged' | 'lost' };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
}) {
  const { createCopy } = useLibraryBookCopies(book?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewCopyNumbers = () => {
    const numbers: string[] = [];
    for (let i = 0; i < Math.min(formData.count, 5); i++) {
      numbers.push(`${formData.prefix}${String(formData.startNumber + i).padStart(3, '0')}`);
    }
    if (formData.count > 5) {
      numbers.push('...');
      numbers.push(`${formData.prefix}${String(formData.startNumber + formData.count - 1).padStart(3, '0')}`);
    }
    return numbers;
  };

  const handleSubmit = async () => {
    if (!book) return;
    setIsSubmitting(true);
    try {
      for (let i = 0; i < formData.count; i++) {
        await createCopy.mutateAsync({
          book_id: book.id,
          copy_number: `${formData.prefix}${String(formData.startNumber + i).padStart(3, '0')}`,
          condition: formData.condition,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Add Copies</DialogTitle>
          <DialogDescription>Add multiple copies of "{book?.title}"</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prefix</Label>
                <Input
                  value={formData.prefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                  placeholder="e.g., MATH-"
                />
              </div>
              <div className="grid gap-2">
                <Label>Start Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.startNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Number of Copies</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.count}
                  onChange={(e) => setFormData(prev => ({ ...prev, count: Math.min(100, parseInt(e.target.value) || 1) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, condition: val as 'good' | 'fair' | 'damaged' | 'lost' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {previewCopyNumbers().map((num, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? `Adding ${formData.count} copies...` : `Add ${formData.count} Copies`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
