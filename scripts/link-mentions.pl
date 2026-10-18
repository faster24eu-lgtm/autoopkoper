# Usage: perl scripts/link-mentions.pl .        apply scripts/link-mentions.txt
#        perl scripts/link-mentions.pl . dry    only report
# Turns the first unlinked mention of a target phrase in a <p> or <li> inside <main> into a link (Dutch pages).
# The visible text never changes: only <a href="/.." data-ml> and </a> are inserted. The script checks this and dies otherwise.
# Never inside card links, <figure>/<blockquote> or paragraphs that quote someone. Skips a target the page already
# links inside <main>. At most $MAX new links per page. Rerunnable (old data-ml links are removed first).
use strict; use warnings; use File::Find;
my($R,$mode)=@ARGV; $mode//='apply'; my $MAX=4; my %P;
find({no_chdir=>1,wanted=>sub{ return unless m#/index\.html$#; my $d=$File::Find::dir; return if $d=~m#\.git|/(fr|bedankt|privacy|scripts)(/|$)#;
  (my $rel=$d)=~s/^\Q$R\E//; $rel="$rel/"; $rel=~s#//#/#g; $rel='/' if $rel eq ''; local $/; open my $f,'<:raw',$File::Find::name; $P{$rel}=<$f>; }},$R);
sub norm{ my($base,$h)=@_; $h=~s/[#?].*//; return undef if $h eq ''; if($h=~m#^https?://#){ return undef unless $h=~s#^https?://(www\.)?autoopkoper\.com##; $h||='/'; }
  elsif($h!~m#^/#){ $h=$base.$h; } 1 while $h=~s#/\./#/#; 1 while $h=~s#/[^/]+/\.\./#/#; $h=~s#index\.html$##; $h.='/' unless $h=~m#/$#; $h }
sub text{ my $s=shift; $s=~s/<[^>]+>//g; $s }
my @T; open my $c,'<:raw',"$R/scripts/link-mentions.txt" or die $!;
while(<$c>){ s/\r?\n$//; next if /^\s*(#|$)/; my($t,$ph,$ex)=split /\t/; push @T,[$t,[split /\|/,$ph],{map{$_=>1}split ' ',$ex//''}] }
my($pages,$links)=(0,0); my %per;
for my $p(sort keys %P){ my $h=$P{$p}; my $orig=$h; $h=~s#<a href="[^"]*" data-ml>(.*?)</a>#$1#gs;   # rerunnable
  my($pre,$main,$post)=$h=~m#^(.*?<main\b[^>]*>)(.*)(</main>.*)$#s or next;
  my $before=text($main); my %linked; while($main=~/<a [^>]*href="([^"]+)"/g){ my $u=norm($p,$1); $linked{$u}=1 if defined $u }
  my @keep; $main=~s{(<a\b[^>]*>(?:(?!</a>).)*?<(?:p|li|h3)\b.*?</a>|<figure\b.*?</figure>|<blockquote\b.*?</blockquote>|<p\b[^>]*>[^<]*(?:&ldquo;|&bdquo;|&laquo;).*?</p>)}{push @keep,$1; "\x00".$#keep."\x00"}gse;
  my $n=0; my @made;
  for my $t(@T){ my($target,$phr,$ex)=@$t; last if $n>=$MAX; next if $target eq $p || $linked{$target} || $ex->{$p};
    my $done=0;
    for my $ph(@$phr){ last if $done;
      $main=~s{(<(p|li)\b[^>]*>)(.*?)(</\2>)}{ my($o,$tag,$in,$e)=($1,$2,$3,$4);
        unless($done || ($tag eq 'li' && $in=~/<a\b/)){ my @parts=split /(<[^>]+>)/,$in; my $ina=0;
          for my $x(@parts){ if($x=~/^</){ $ina++ if $x=~/^<a\b/i; $ina-- if $x=~m#^</a>#i; next } next if $ina || $done;
            if($x=~s{(?<![\w\-])(?<!\d\s)(\Q$ph\E)(?![\w\-])}{'<a href="'.$target.'" data-ml>'.$1.'</a>'}ie){ $done=1 } }
          $in=join '',@parts }
        "$o$in$e" }gse; }
    if($done){ $n++; push @made,$target } }
  $main=~s/\x00(\d+)\x00/$keep[$1]/g;
  die "$p: visible text changed\n" unless text($main) eq $before;
  if($n){ $pages++; $links+=$n; $per{$p}=join ' ',@made }
  $h=$pre.$main.$post;
  if($h ne $orig && $mode ne 'dry'){ (my $f="$R$p")=~s#/$#/index.html#; open my $o,'>:raw',$f or die; print $o $h } }
printf "  %-40s %s\n",$_,$per{$_} for sort keys %per;
printf "%s: %d links on %d pages\n",($mode eq 'dry'?'dry run':'written'),$links,$pages;
