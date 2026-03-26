// Generate dynamic, goal-specific recommendations based on user audit data
export function generateImmediateMoves(goals, struggles, contentType) {
  const moves = [];

  // Goal: Grow followers
  if (goals?.toLowerCase().includes("grow") || goals?.toLowerCase().includes("audience")) {
    moves.push(
      "Create a 'Welcome Series' pinned post: Introduce your business, what followers will get, and your best performing post",
      "Optimize your profile CTA button to 'Learn More' and link to your website or most important resource",
      "Post 1 short-form video this week using trending audio—repurpose your best-performing existing content"
    );
  }

  // Goal: Increase engagement
  if (goals?.toLowerCase().includes("engagement")) {
    moves.push(
      "Create 3 'Question Posts' this week asking your audience for opinions or experiences",
      "Reply to every comment on your posts within the first hour of posting",
      "Create a poll or quiz post asking followers about their biggest challenge"
    );
  }

  // Goal: Build authority / leads
  if (goals?.toLowerCase().includes("lead") || goals?.toLowerCase().includes("authority")) {
    moves.push(
      "Create 2 'authority posts' this week: Share 3 specific tips or lessons from your expertise",
      "Pin a high-value post or case study to your profile showing your best work",
      "Add a 'Message Us' CTA to your 3 most recent posts asking for inquiries"
    );
  }

  // Struggling with consistency
  if (struggles?.toLowerCase().includes("inconsistent")) {
    moves.push("Schedule your next 30 days of content using a content calendar (start with 5-7 posts)");
  }

  // Default if no specific goals matched
  if (moves.length === 0) {
    moves.push(
      "Optimize your page's primary CTA to match your main business goal",
      "Pin your highest-engagement post to the top of your page",
      "Audit and update your 'About' section with a clear value proposition"
    );
  }

  return moves.slice(0, 5);
}

export function generateContentStrategy(goals, contentType, postingFrequency) {
  const strategy = {
    frequency: "Post 4–5 times per week",
    mix: [],
  };

  // Determine posting frequency recommendation
  if (postingFrequency?.toLowerCase().includes("rarely") || postingFrequency?.toLowerCase().includes("inconsistent")) {
    strategy.frequency = "Post 5–7 times per week to establish consistency";
  } else if (postingFrequency?.toLowerCase().includes("week")) {
    strategy.frequency = "Post 4–5 times per week for optimal reach";
  } else if (postingFrequency?.toLowerCase().includes("daily")) {
    strategy.frequency = "Maintain 5–7 posts per week (quality over quantity)";
  }

  // Build content mix based on goals
  if (goals?.toLowerCase().includes("grow")) {
    strategy.mix = [
      "2 short-form videos (Reels) using trending audio",
      "1 carousel post showcasing your best work or results",
      "1 question/engagement post asking your audience for input",
      "1 educational or value-driven post",
    ];
  } else if (goals?.toLowerCase().includes("engagement")) {
    strategy.mix = [
      "2 question/poll posts sparking conversation",
      "1 behind-the-scenes or relatable personal post",
      "1 short-form video",
      "1 user-generated content repost or testimonial",
    ];
  } else if (goals?.toLowerCase().includes("lead") || goals?.toLowerCase().includes("authority")) {
    strategy.mix = [
      "2 authority posts sharing tips, frameworks, or expertise",
      "1 case study or results-driven post",
      "1 short-form educational video",
      "1 engagement question tied to your offer or service",
    ];
  } else {
    strategy.mix = [
      "2 short-form videos",
      "1 carousel or image post",
      "1 question or engagement post",
      "1 educational or value post",
    ];
  }

  return strategy;
}

export function generateBlockers(struggles, postingFrequency, contentType) {
  const blockers = [];

  if (!struggles || struggles.length === 0) {
    return [
      "Page discovery may be limited by profile completeness or CTA optimization",
      "Content mix might not be aligned with your audience's preferences",
      "Consistency gaps could be limiting algorithmic reach and visibility",
    ];
  }

  if (struggles?.toLowerCase().includes("engagement")) {
    blockers.push(
      "Your content is not asking your audience to interact—without comments, shares, or reactions, Facebook limits visibility",
      "You may be posting content that's too promotional rather than educational or entertaining"
    );
  }

  if (struggles?.toLowerCase().includes("grow") || struggles?.toLowerCase().includes("audience")) {
    blockers.push("Profile may lack a clear value proposition—new visitors don't know why they should follow");
  }

  if (struggles?.toLowerCase().includes("inconsistent")) {
    blockers.push(
      "Inconsistent posting signals inactivity to Facebook's algorithm—reach drops significantly with gaps",
      "Your audience doesn't know when to expect new content, leading to lower engagement"
    );
  }

  if (struggles?.toLowerCase().includes("reach")) {
    blockers.push("Content mix may not align with what generates reach on Facebook (video typically outperforms static posts)");
  }

  if (blockers.length === 0) {
    blockers.push(
      "Content may not be optimized for mobile viewing",
      "CTA is unclear or misaligned with audience expectations",
      "Post timing may not match when your audience is most active"
    );
  }

  return blockers.slice(0, 3);
}