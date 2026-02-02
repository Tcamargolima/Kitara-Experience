import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ProductsTab allows administrators to view and manage a list of
 * products. Admins can create new products via a dialog form.
 * Clients can see the catalogue but do not have access to the
 * creation dialog (controlled upstream via role‑based tabs).
 */
const ProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const { toast } = useToast();

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // Subscribe to real‑time changes on products
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => fetchProducts(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !price.trim()) {
      toast({
        title: "Validation error",
        description: "Name and price are required",
        variant: "destructive",
      });
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      toast({
        title: "Validation error",
        description: "Price must be a number",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: parsedPrice,
    });
    if (error) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Product created" });
      setOpen(false);
      setName("");
      setDescription("");
      setPrice("");
      // Products will refresh via subscription
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-cinzel text-secondary">Products</h2>
          <p className="text-muted-foreground">Manage your product catalogue</p>
        </div>
        {/* Only show create button for admins; wrapper can control visibility */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="kitara-button">Add Product</Button>
          </DialogTrigger>
          <DialogContent className="kitara-card">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-secondary">New Product</DialogTitle>
              <DialogDescription>Enter product details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="kitara-input" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="kitara-input" />
              </div>
              <div>
                <Label>Price (e.g., 19.99)</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} className="kitara-input" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="kitara-button">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <Card className="kitara-card">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading products...</p>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="kitara-card">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="kitara-card">
              <CardHeader>
                <CardTitle className="text-secondary">{product.name}</CardTitle>
                {product.description && (
                  <CardDescription className="text-muted-foreground">{product.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">Price: ${product.price?.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
