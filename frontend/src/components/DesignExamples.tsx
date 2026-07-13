// Example Component: Using the TaMaD Design System
// This file demonstrates best practices for using design components

import React, { useState } from 'react';
import { Card, Button, Badge, StatCard, SectionHeader, GradientText } from './DesignComponents';
import { CheckCircle2, Clock, AlertTriangle, Flame } from 'lucide-react';

export default function DesignExamples() {
  const [selectedTheme, setSelectedTheme] = useState('default');

  return (
    <div className="p-8 space-y-12">
      {/* Example 1: Card Variations */}
      <section>
        <SectionHeader title="Card Variations" subtitle="Different card styles for different use cases" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Glass Card - Modern & Elegant */}
          <Card variant="glass" className="space-y-4">
            <Badge variant="solid" size="sm">Featured</Badge>
            <h3 className="text-lg font-bold text-white">Modern Glass</h3>
            <p className="text-sm text-slate-400">Perfect for floating, modern designs with a frosted glass effect.</p>
            <Button variant="primary" size="sm">Learn More</Button>
          </Card>

          {/* Gradient Card - Vibrant */}
          <Card variant="gradient" className="space-y-4">
            <Badge variant="outline" size="sm">Gradient</Badge>
            <h3 className="text-lg font-bold text-white">Gradient Style</h3>
            <p className="text-sm text-slate-400">Great for highlighting important content with gradient backgrounds.</p>
            <Button variant="secondary" size="sm">Explore</Button>
          </Card>

          {/* Neon Card - Bold */}
          <Card variant="neon" className="space-y-4">
            <Badge variant="solid" size="sm">Bold</Badge>
            <h3 className="text-lg font-bold text-white">Neon Border</h3>
            <p className="text-sm text-slate-400">Makes a statement with a colored border and strong presence.</p>
            <Button variant="outline" size="sm">Discover</Button>
          </Card>
        </div>
      </section>

      {/* Example 2: Button Gallery */}
      <section>
        <SectionHeader title="Button Showcase" subtitle="All available button styles and sizes" />
        
        <div className="space-y-6">
          {/* Primary Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Primary Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Secondary Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm">Small</Button>
              <Button variant="secondary" size="md">Medium</Button>
              <Button variant="secondary" size="lg">Large</Button>
            </div>
          </div>

          {/* Ghost Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Ghost Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm">Small</Button>
              <Button variant="ghost" size="md">Medium</Button>
              <Button variant="ghost" size="lg">Large</Button>
            </div>
          </div>

          {/* Outline Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Outline Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="outline" size="md">Medium</Button>
              <Button variant="outline" size="lg">Large</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Example 3: Badge Collection */}
      <section>
        <SectionHeader title="Badge Variations" subtitle="Display tags, labels, and status indicators" />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="default" size="sm">Small</Badge>
            <Badge variant="solid" size="md">Medium</Badge>
            <Badge variant="outline" size="lg">Large</Badge>
          </div>
        </div>
      </section>

      {/* Example 4: Stat Cards Dashboard */}
      <section>
        <SectionHeader title="Dashboard Stats" subtitle="Display metrics with stat cards" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={CheckCircle2} 
            label="Completed" 
            value="142"
            color="brand"
            sub="This month"
          />
          <StatCard 
            icon={Clock} 
            label="In Progress" 
            value="28"
            color="blue"
            sub="Active tasks"
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Overdue" 
            value="5"
            color="red"
            sub="Need attention"
          />
          <StatCard 
            icon={Flame} 
            label="Streak" 
            value="12"
            color="amber"
            sub="Days active"
          />
        </div>
      </section>

      {/* Example 5: Layout Examples */}
      <section>
        <SectionHeader title="Layout Patterns" subtitle="Common layout combinations" />
        
        <div className="space-y-4">
          {/* Horizontal Layout - Space Between */}
          <Card variant="glass" className="align-between p-4">
            <span className="text-white font-semibold">Left Content</span>
            <span className="text-white font-semibold">Right Content</span>
          </Card>

          {/* Centered Content */}
          <Card variant="gradient" className="align-center p-8">
            <GradientText className="text-2xl font-bold">
              Centered Gradient Text
            </GradientText>
          </Card>

          {/* Grid with Spacing */}
          <Card variant="minimal" className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="align-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-semibold">Item 1</span>
              </div>
              <div className="align-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-semibold">Item 2</span>
              </div>
              <div className="align-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-semibold">Item 3</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Example 6: Texture Showcase */}
      <section>
        <SectionHeader title="Texture Effects" subtitle="Add visual interest with textures" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="texture-noise p-8 align-center min-h-48">
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">Noise</div>
              <p className="text-xs text-slate-500">Subtle texture</p>
            </div>
          </Card>

          <Card variant="glass" className="texture-grid p-8 align-center min-h-48">
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">Grid</div>
              <p className="text-xs text-slate-500">Grid pattern</p>
            </div>
          </Card>

          <Card variant="glass" className="texture-dots p-8 align-center min-h-48">
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">Dots</div>
              <p className="text-xs text-slate-500">Dot pattern</p>
            </div>
          </Card>

          <Card variant="glass" className="texture-stripes p-8 align-center min-h-48">
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">Stripes</div>
              <p className="text-xs text-slate-500">Stripe pattern</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Example 7: Animation Showcase */}
      <section>
        <SectionHeader title="Animations" subtitle="Interactive animations for engagement" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" className="align-center p-8 min-h-48">
            <div className="animate-float">
              <div className="text-3xl">🎈</div>
              <p className="text-sm text-slate-400 mt-2">Float</p>
            </div>
          </Card>

          <Card variant="glass" className="align-center p-8 min-h-48">
            <div className="animate-glow-pulse">
              <div className="text-3xl">✨</div>
              <p className="text-sm text-slate-400 mt-2">Glow Pulse</p>
            </div>
          </Card>

          <Card variant="glass" className="align-center p-8 min-h-48">
            <div className="animate-shimmer bg-gradient-to-r from-brand via-brand-light to-brand-soft bg-200% p-4 rounded-lg">
              <p className="text-sm text-white font-semibold">Shimmer</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Example 8: Combined Best Practices */}
      <section>
        <SectionHeader 
          title="Complete Example" 
          subtitle="Combining multiple design elements"
          action={<Button variant="primary">Get Started</Button>}
        />
        
        <Card variant="glass" className="space-y-6 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-2">
                Complete Design Example
              </h3>
              <p className="text-slate-400">
                This card demonstrates best practices for combining multiple design elements together.
              </p>
            </div>
            <Badge variant="solid">Example</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="align-center p-4 bg-white/5 rounded-lg">
              <Badge variant="outline" size="sm">Design</Badge>
            </div>
            <div className="align-center p-4 bg-white/5 rounded-lg">
              <Badge variant="success" size="sm">Quality</Badge>
            </div>
            <div className="align-center p-4 bg-white/5 rounded-lg">
              <Badge variant="info" size="sm">Modern</Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary">Accept</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <div className="border-t border-white/10 pt-8">
        <p className="text-center text-slate-500 text-sm">
          For more examples and documentation, visit the <GradientText>Design System Guide</GradientText>
        </p>
      </div>
    </div>
  );
}
