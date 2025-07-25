import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    ArrowRight,
    User,
    ChevronLeft,
    ChevronRight,
    FileText,
} from "lucide-react";
import { BlogPost } from "@/../../shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import GeneratedExcerpt from "@/components/generated-excerpt";
import { useState } from "react";

interface BlogPostsResponse {
    posts: BlogPost[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export default function BlogPage() {
    const [currentPage, setCurrentPage] = useState(1);

    const { data: blogData, isLoading } = useQuery<BlogPostsResponse>({
        queryKey: ["/api/blog-posts", currentPage],
        queryFn: () =>
            fetch(`/api/blog-posts?page=${currentPage}&limit=12`).then((res) =>
                res.json(),
            ),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: featuredPost } = useQuery<BlogPost>({
        queryKey: ["/api/blog-posts/featured"],
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const posts = blogData?.posts || [];
    const pagination = blogData?.pagination;

    // Function to extract first image from content
    const extractFirstImage = (content: string): string | null => {
        if (!content) return null;

        // First priority: Look for iframe with video thumbnails (YouTube, Vimeo)
        // Handle both regular and HTML-encoded quotes
        const iframeMatches = content.match(/<iframe[^>]*>/gi);
        if (iframeMatches) {
            for (const iframe of iframeMatches) {
                // Try multiple src patterns including HTML encoded quotes
                const srcPatterns = [
                    /src=["']([^"']+)["']/i,
                    /src=""([^""]+)""/i, // HTML encoded double quotes
                    /src='([^']+)'/i,
                    /src=([^\s>]+)/i,
                ];

                let src = null;
                for (const pattern of srcPatterns) {
                    const srcMatch = iframe.match(pattern);
                    if (srcMatch) {
                        src = srcMatch[1];
                        break;
                    }
                }

                if (src) {
                    // Generate YouTube thumbnail
                    if (src.includes("youtube.com") || src.includes("youtu.be")) {
                        const videoIdMatch = src.match(
                            /(?:youtube\.com\/embed\/|youtu\.be\/)([^?&\/#]+)/,
                        );
                        if (videoIdMatch) {
                            return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
                        }
                    }

                    // Generate Vimeo thumbnail
                    if (src.includes("vimeo.com")) {
                        const videoIdMatch = src.match(/vimeo\.com\/video\/(\d+)/);
                        if (videoIdMatch) {
                            return `https://vumbnail.com/${videoIdMatch[1]}.jpg`;
                        }
                    }

                    // Handle player.vimeo.com URLs
                    if (src.includes("player.vimeo.com")) {
                        const videoIdMatch = src.match(/player\.vimeo\.com\/video\/(\d+)/);
                        if (videoIdMatch) {
                            return `https://vumbnail.com/${videoIdMatch[1]}.jpg`;
                        }
                    }
                }
            }
        }

        // Second priority: Look for img tags with various src patterns
        const imgMatches = [
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
            /<img[^>]+src=([^\s>]+)[^>]*>/gi,
        ];

        for (const regex of imgMatches) {
            const match = content.match(regex);
            if (match) {
                // Extract src from the full img tag
                const srcMatch = match[0].match(/src=["']?([^"'\s>]+)/i);
                if (srcMatch && srcMatch[1]) {
                    const src = srcMatch[1];
                    // Make sure it's a valid image URL
                    if (
                        src.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) ||
                        src.startsWith("http") ||
                        src.startsWith("/")
                    ) {
                        return src;
                    }
                }
            }
        }

        return null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Blog - Latest Insights | anewgo"
                description="Stay informed with anewgo's latest thinking on new home marketing, industry trends, and strategic insights for home builders."
                keywords="new home marketing blog, real estate insights, home builder trends, marketing strategies, industry analysis, anewgo insights"
            />
            <Header />

            {/* Featured Article */}
            {featuredPost && (
                <div className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Featured Article
                            </h2>
                            <p className="text-lg text-gray-600">
                                Don't miss our latest insights on new home marketing and
                                industry trends.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <Link href={`/blog/${featuredPost.slug}`}>
                                <Card className="cursor-pointer border-0">
                                    {featuredPost.featuredImage ? (
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={featuredPost.featuredImage}
                                                alt={featuredPost.title}
                                                className="w-full h-64 object-cover"
                                            />
                                        </div>
                                    ) : (
                                        (() => {
                                            const extractedImage = extractFirstImage(
                                                featuredPost.content || "",
                                            );
                                            return extractedImage ? (
                                                <div className="relative overflow-hidden h-64">
                                                    <img
                                                        src={extractedImage}
                                                        alt={featuredPost.title}
                                                        className="w-full h-64 object-cover"
                                                        onError={(e) => {
                                                            // Try fallback to YouTube standard resolution if maxresdefault fails
                                                            const currentSrc = e.currentTarget.src;
                                                            if (currentSrc.includes("maxresdefault.jpg")) {
                                                                e.currentTarget.src = currentSrc.replace(
                                                                    "maxresdefault.jpg",
                                                                    "hqdefault.jpg",
                                                                );
                                                                return;
                                                            }
                                                            // If all image attempts fail, hide the image
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                    <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded">
                                                        Featured • From Article
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative overflow-hidden h-64 bg-gradient-to-br from-[#facb0d]/5 to-[#e6b800]/10 border-l-4 border-[#facb0d] p-6">
                                                    <div className="text-left h-full flex flex-col">
                                                        <div className="text-xs text-gray-500 mb-3 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            Featured Article •{" "}
                                                            {featuredPost.publishedAt
                                                                ? new Date(
                                                                    featuredPost.publishedAt,
                                                                ).toLocaleDateString("en-US", {
                                                                    timeZone: "UTC",
                                                                })
                                                                : new Date(
                                                                    featuredPost.createdAt!,
                                                                ).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-gray-700 leading-relaxed flex-grow overflow-hidden">
                                                            {featuredPost.content
                                                                ? featuredPost.content
                                                                    .replace(/<[^>]*>/g, "")
                                                                    .substring(0, 400) +
                                                                (featuredPost.content.length > 400
                                                                    ? "..."
                                                                    : "")
                                                                : featuredPost.excerpt ||
                                                                "No content preview available"}
                                                        </div>
                                                        <div className="absolute bottom-4 right-4 bg-[#facb0d]/20 rounded-full p-2">
                                                            <FileText className="w-4 h-4 text-[#e6b800]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    )}
                                    <CardHeader className="pb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="secondary" className="text-sm">
                                                Featured Article
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl text-left mb-6">
                                            {featuredPost.title}
                                        </CardTitle>
                                        <div className="text-sm text-gray-500 flex items-center mb-1">
                                            <User className="w-4 h-4 mr-2" />
                                            By {featuredPost.author || "Anewgo Team"}
                                        </div>
                                        <CardDescription className="flex items-center text-left">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {featuredPost.publishedAt
                                                ? new Date(featuredPost.publishedAt).toLocaleDateString(
                                                    "en-US",
                                                    { timeZone: "UTC" },
                                                )
                                                : new Date(
                                                    featuredPost.createdAt!,
                                                ).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {featuredPost.excerpt && (
                                            <p className="text-gray-600 mb-6 text-left leading-relaxed">
                                                {featuredPost.excerpt}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-3">
                                            <span className="bg-[#facb0d] text-black px-4 py-2 rounded inline-flex items-center font-semibold hover:underline cursor-pointer">
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                Read Full Article
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* All Articles */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            All Articles
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explore our complete library of insights featuring industry
                            expertise, innovative strategies, and proven techniques for new
                            home marketing success.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {posts?.map((post, index) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card
                                    className="cursor-pointer border-0"
                                    style={{
                                        borderTop: "0.75px solid rgba(0, 0, 0, 0.6)",
                                        ...(index === posts.length - 1 && {
                                            borderBottom: "0.75px solid rgba(0, 0, 0, 0.6)",
                                        }),
                                    }}
                                >
                                    <div
                                        className="flex flex-col h-full"
                                        style={{ padding: "25px" }}
                                    >
                                        <div className="flex flex-1">
                                            {/* Text Content - 3/5 width */}
                                            <div className="flex-[3]">
                                                <div className="text-sm text-black/80 mb-3">
                                                    {post.author || "Anewgo Team"} |{" "}
                                                    {post.publishedAt
                                                        ? new Date(post.publishedAt).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                timeZone: "UTC",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            },
                                                        )
                                                        : new Date(post.createdAt!).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            },
                                                        )}
                                                </div>
                                                <CardTitle className="text-xl leading-tight text-left mb-3">
                                                    {post.title}
                                                </CardTitle>
                                            </div>

                                            {/* Image - 2/5 width */}
                                            <div className="flex-[2] min-h-[200px] ml-4">
                                                {post.featuredImage ? (
                                                    <div className="relative w-full h-full bg-gray-200 overflow-hidden">
                                                        <img
                                                            src={post.featuredImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    (() => {
                                                        const extractedImage = extractFirstImage(
                                                            post.content || "",
                                                        );
                                                        return extractedImage ? (
                                                            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
                                                                <img
                                                                    src={extractedImage}
                                                                    alt={post.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const currentSrc = e.currentTarget.src;
                                                                        if (
                                                                            currentSrc.includes("maxresdefault.jpg")
                                                                        ) {
                                                                            e.currentTarget.src = currentSrc.replace(
                                                                                "maxresdefault.jpg",
                                                                                "hqdefault.jpg",
                                                                            );
                                                                            return;
                                                                        }
                                                                        e.currentTarget.style.display = "none";
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                <div className="text-gray-400 text-center">
                                                                    <FileText className="w-8 h-8 mx-auto mb-1" />
                                                                    <span className="text-xs">No image</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()
                                                )}
                                            </div>
                                        </div>

                                        {/* AI-Generated Excerpt at bottom */}
                                        <div
                                            className="mt-4 pt-3"
                                            style={{ borderTop: "1px solid #e5e7eb" }}
                                        >
                                            <GeneratedExcerpt
                                                postId={post.id!}
                                                currentExcerpt={post.excerpt}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <div className="flex items-center space-x-2">
                                {/* Previous Page */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    disabled={!pagination.hasPreviousPage}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </Button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1">
                                    {Array.from(
                                        { length: pagination.totalPages },
                                        (_, i) => i + 1,
                                    ).map((pageNum) => {
                                        const isCurrentPage = pageNum === pagination.currentPage;
                                        const showPage =
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            Math.abs(pageNum - pagination.currentPage) <= 1;

                                        if (!showPage) {
                                            if (
                                                pageNum === pagination.currentPage - 2 ||
                                                pageNum === pagination.currentPage + 2
                                            ) {
                                                return (
                                                    <span key={pageNum} className="px-2 text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={isCurrentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setCurrentPage(pageNum);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className={
                                                    isCurrentPage
                                                        ? "bg-[#facb0d] hover:bg-[#e6b800] text-black"
                                                        : ""
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {/* Next Page */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentPage(currentPage + 1);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    disabled={!pagination.hasNextPage}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscribe Section */}
            <div className="py-16 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Subscribe to our newsletter and never miss the latest insights on
                        new home marketing.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button className="bg-[#facb0d] hover:bg-[#e6b800] text-black">
                            Subscribe to Newsletter
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-gray-900"
                        >
                            Follow on LinkedIn
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
