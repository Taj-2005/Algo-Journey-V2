'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, CheckCircle, X, ChevronDown, ChevronUp, Ban, Award, Code } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import Link from 'next/link';

interface Question {
  question: {
    id: string;
    leetcodeUrl?: string;
    codeforcesUrl?: string;
    difficulty: string;
    points: number;
    slug: string;
  };
}

interface Submission {
  id: string;
  score: number;
  status: string;
  createdAt: string;
  question: {
    id: string;
    slug: string;
    points: number;
  };
}

interface Member {
  id: string;
  username: string;
  submissions: Submission[];
  isAllowedToParticipate?: boolean;
}

interface Group {
  id: string;
  name: string;
  score: number;
  coordinator: {
    username: string;
  };
  members: Member[];
}

interface GroupOnContest {
  id: string;
  score: number;
  group: Group;
}

interface Contest {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  questions: Question[];
  attemptedGroups: GroupOnContest[];
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-12 w-3/4" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const getEarliestSubmissionTime = (member: Member) => {
  if (!member.submissions || member.submissions.length === 0) return Infinity;
  
  return Math.min(...member.submissions.map(sub => 
    new Date(sub.createdAt).getTime()
  ));
};

const GroupSubmissions = ({ group, questions }: { 
  group: Group; 
  questions: Question[];
}) => {
  // Sort members by points and submission time
  const sortedMembers = [...group.members].sort((a, b) => {
    // Calculate total points for each member
    const aTotal = a.submissions?.reduce((total, sub) => total + sub.score, 0) || 0;
    const bTotal = b.submissions?.reduce((total, sub) => total + sub.score, 0) || 0;
    
    // First sort by participation status
    if (a.isAllowedToParticipate === false && b.isAllowedToParticipate !== false) return 1;
    if (a.isAllowedToParticipate !== false && b.isAllowedToParticipate === false) return -1;
    
    // Then sort by points (descending)
    if (aTotal !== bTotal) return bTotal - aTotal;
    
    // If points are equal, sort by earliest submission time
    const aEarliest = getEarliestSubmissionTime(a);
    const bEarliest = getEarliestSubmissionTime(b);
    
    return aEarliest - bEarliest; // Earlier submission comes first
  });

  return (
    <div className="mt-3 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16 py-3">Rank</TableHead>
            <TableHead className="w-32 py-3">Member</TableHead>
            {questions?.map((q, index) => (
              <TableHead key={q.question.id} className="text-center py-3">
                <div className="font-semibold">Q{String.fromCharCode(65 + index)}</div>
                <div className="text-xs text-gray-500 font-normal">
                  {q.question.points} pts
                </div>
              </TableHead>
            ))}
            <TableHead className="text-right py-3 pr-6">Total Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMembers.map((member, index) => {
            const memberTotal = member.submissions?.reduce((total, sub) => total + sub.score, 0) || 0;
            
            return (
              <TableRow key={member.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium py-3">
                  {member.isAllowedToParticipate === false ? "-" : index + 1}
                </TableCell>
                <TableCell className="font-medium py-3">
                  <div className="flex items-center gap-2">
                    {member.username}
                    {member.isAllowedToParticipate === false && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <Ban className="h-3 w-3" />
                        Not Allowed
                      </span>
                    )}
                  </div>
                </TableCell>
                {questions?.map((q) => {
                  const submission = member.submissions?.find(
                    (s) => s.question.id === q.question.id
                  );
                  
                  if (member.isAllowedToParticipate === false) {
                    return (
                      <TableCell key={q.question.id} className="text-center py-3">
                        <div className="flex flex-col items-center">
                          <Ban className="h-4 w-4 text-red-400" />
                          <span className="text-xs text-red-400 mt-1">
                            N/A
                          </span>
                        </div>
                      </TableCell>
                    );
                  }
                  
                  return (
                    <TableCell key={q.question.id} className="text-center py-3">
                      {submission ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600 mt-1">
                            {submission.score}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(submission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-400 mt-1">
                            0
                          </span>
                        </div>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-semibold py-3 pr-6">
                  {member.isAllowedToParticipate === false ? (
                    <span className="text-red-500">N/A</span>
                  ) : (
                    memberTotal
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-gray-50 border-t border-gray-200">
            <TableCell colSpan={questions.length + 2} className="font-bold py-3">
              Group Total
            </TableCell>
            <TableCell className="text-right font-bold py-3 pr-6">
              {group.score}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

const GroupDetails = ({ group, questions, rank }: { 
  group: Group; 
  questions: Question[]; 
  rank: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const participatingMembers = group.members.filter(m => m.isAllowedToParticipate !== false);
  const nonParticipatingMembers = group.members.filter(m => m.isAllowedToParticipate === false);

  const getRankBadgeColor = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-100 text-yellow-800";
      case 2: return "bg-gray-100 text-gray-800";
      case 3: return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="border border-gray-100 rounded-lg mb-3 overflow-hidden shadow-sm">
      <div 
        className="px-5 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Badge 
            className={`${getRankBadgeColor(rank)} w-8 h-8 flex items-center justify-center rounded-full mr-3 font-bold`}
          >
            {rank}
          </Badge>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <h3 className="text-md font-semibold text-gray-800">{group.name}</h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Coordinator: {group.coordinator?.username} • 
              Participating: {participatingMembers.length} • 
              Not Allowed: {nonParticipatingMembers.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">{group.score}</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-100">
          <GroupSubmissions 
            group={group}
            questions={questions}
          />
        </div>
      )}
    </div>
  );
};

const ContestDetails = ({ contest }: { contest: Contest }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toUpperCase()) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800';
      case 'HARD': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <Link href={`/contest/${contest.id}`} className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
              Contest #{contest.id}
            </Link>
          </CardTitle>
          <Badge>
            {contest.status === 'ACTIVE' ? 'Active' : 'Completed'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-2">
        {/* Questions Section */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-indigo-500" /> 
            Problems
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 py-3">#</TableHead>
                  <TableHead className="py-3">Problem</TableHead>
                  <TableHead className="text-right py-3">Difficulty</TableHead>
                  <TableHead className="text-right py-3">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contest.questions?.map((q, index) => (
                  <TableRow key={q.question.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="py-3 font-medium">{String.fromCharCode(65 + index)}</TableCell>
                    <TableCell className="py-3">
                      <Link 
                        href={q.question.leetcodeUrl || q.question.codeforcesUrl || ''} 
                        target='_blank'
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {q.question.slug}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Badge className={getDifficultyColor(q.question.difficulty)}>
                        {q.question.difficulty.charAt(0) + q.question.difficulty.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium py-3">{q.question.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Rankings Section */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-rose-500" /> 
            Team Rankings
          </h3>
          
          {contest.attemptedGroups?.length ? (
            contest.attemptedGroups.map((groupEntry, index) => (
              <GroupDetails
                key={groupEntry.id}
                group={groupEntry.group}
                questions={contest.questions || []}
                rank={index + 1}
              />
            ))
          ) : (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              No groups have attempted this contest yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ContestsPage = () => {
  const { data: contests, isLoading, error } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const response = await axios.get('/api/contests');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 pt-20 space-y-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 pt-20 space-y-8">
        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="text-center py-12">
            <X className="h-12 w-12 mx-auto mb-3 text-rose-300" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">Error loading contests</h3>
            <p className="text-gray-500">Please try again later</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-20 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contest History</h1>
          <p className="text-gray-600 mt-1">Track your team&apos;s performance across competitions</p>
        </div>
      </div>

      {contests?.length ? (
        <div className="space-y-6">
          {contests.map((contest: Contest) => (
            <ContestDetails key={contest.id} contest={contest} />
          ))}
        </div>
      ) : (
        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">No contests available</h3>
            <p className="text-gray-500">Check back later for upcoming competitions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContestsPage;